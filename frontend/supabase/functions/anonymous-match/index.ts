import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MatchProfile {
  id: string;
  interests?: string[] | null;
  communication_style?: string | null;
  bio?: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticate the caller via JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client for data operations
    const supabase = createClient(supabaseUrl, serviceKey);

    // Check user has active anonymous profile
    const { data: myProfile } = await supabase
      .from("anonymous_profiles")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (!myProfile) {
      return new Response(JSON.stringify({ error: "No active anonymous profile" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for existing active match
    const { data: existingMatch } = await supabase
      .from("anonymous_matches")
      .select("*")
      .eq("status", "active")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .maybeSingle();

    if (existingMatch) {
      return new Response(JSON.stringify({ match: existingMatch, message: "Already matched" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's profile for matching
    const { data: myFullProfile } = await supabase
      .from("profiles")
      .select("interests, communication_style, disability_type, gender_identity, bio, support_needs")
      .eq("id", userId)
      .maybeSingle();

    // Find other active anonymous users (excluding self)
    const { data: candidates } = await supabase
      .from("anonymous_profiles")
      .select("user_id")
      .eq("is_active", true)
      .neq("user_id", userId);

    if (!candidates?.length) {
      return new Response(JSON.stringify({ error: "No available matches right now. Try again later!" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter out users who already have active matches
    const candidateIds = candidates.map((c) => c.user_id);
    const { data: busyMatches } = await supabase
      .from("anonymous_matches")
      .select("user1_id, user2_id")
      .eq("status", "active")
      .or(
        candidateIds
          .map((id) => `user1_id.eq.${id},user2_id.eq.${id}`)
          .join(",")
      );

    const busyIds = new Set<string>();
    busyMatches?.forEach((m) => {
      busyIds.add(m.user1_id);
      busyIds.add(m.user2_id);
    });

    const availableIds = candidateIds.filter((id) => !busyIds.has(id));

    if (!availableIds.length) {
      return new Response(JSON.stringify({ error: "All users are currently matched. Try again later!" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get profiles for compatibility scoring
    const { data: candidateProfiles } = await supabase
      .from("profiles")
      .select("id, interests, communication_style, disability_type, gender_identity, bio, support_needs")
      .in("id", availableIds);

    // Use AI for compatibility scoring
    let bestMatch = availableIds[0];
    let bestScore = 50;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (LOVABLE_API_KEY && myFullProfile && candidateProfiles?.length) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are a compatibility matching engine. Given a user's profile and candidate profiles, determine the best match. Use the suggest_best_match tool to return results.`,
              },
              {
                role: "user",
                content: `User profile: ${JSON.stringify(myFullProfile)}\n\nCandidate profiles: ${JSON.stringify(
                  candidateProfiles.map((p) => ({ id: p.id, interests: p.interests, communication_style: p.communication_style, bio: p.bio }))
                )}\n\nAnalyze compatibility based on shared interests, complementary communication styles, and overall compatibility. Return the best match.`,
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "suggest_best_match",
                  description: "Return the best match with compatibility score",
                  parameters: {
                    type: "object",
                    properties: {
                      matched_user_id: { type: "string", description: "The ID of the best matching candidate" },
                      compatibility_score: { type: "number", description: "Score from 1-100" },
                      reason: { type: "string", description: "Brief reason for the match" },
                    },
                    required: ["matched_user_id", "compatibility_score", "reason"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "suggest_best_match" } },
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall) {
            const args = JSON.parse(toolCall.function.arguments);
            if (availableIds.includes(args.matched_user_id)) {
              bestMatch = args.matched_user_id;
              bestScore = Math.min(100, Math.max(1, Math.round(args.compatibility_score)));
            }
          }
        }
      } catch (e) {
        console.error("AI matching failed, using fallback:", e);
        bestScore = calculateFallbackScore(myFullProfile, candidateProfiles, availableIds);
        bestMatch = availableIds[0];
      }
    }

    // Create the match
    const { data: newMatch, error: matchError } = await supabase
      .from("anonymous_matches")
      .insert({
        user1_id: userId,
        user2_id: bestMatch,
        compatibility_score: bestScore,
        status: "active",
      })
      .select()
      .single();

    if (matchError) throw matchError;

    return new Response(JSON.stringify({ match: newMatch }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Match error:", e);
    return new Response(
      JSON.stringify({ error: "An error occurred during matching" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function calculateFallbackScore(
  userProfile: MatchProfile | null,
  candidates: MatchProfile[] | null,
  availableIds: string[]
): number {
  if (!userProfile?.interests?.length || !candidates?.length) return 50 + Math.floor(Math.random() * 30);

  const userInterests = new Set(userProfile.interests.map((i: string) => i.toLowerCase()));
  let maxScore = 0;

  for (const c of candidates) {
    if (!availableIds.includes(c.id)) continue;
    const shared = (c.interests || []).filter((i: string) => userInterests.has(i.toLowerCase())).length;
    const total = Math.max(userInterests.size, (c.interests || []).length, 1);
    const score = Math.round((shared / total) * 60) + 30 + Math.floor(Math.random() * 10);
    if (score > maxScore) maxScore = score;
  }

  return Math.min(100, maxScore || 55);
}
