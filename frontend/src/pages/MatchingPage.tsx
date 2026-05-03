import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const partnerTypes = ["Cute, Humble", "Adventurous", "Intellectual", "Caring", "Creative"];
const purposes = ["Make New Friends", "Casual Dating", "Long-term Relationship", "Activity Partner"];
const genders = ["Woman", "Man", "Non-binary", "Everyone"];
const languages = ["English", "French", "Bengali", "Spanish", "Sign Language (ASL)", "Hindi"];
const disabilityTypes = ["Any", "Colour Blind", "Mobility Impairment", "Hearing Impairment", "Visual Impairment", "Neurodivergent", "Chronic Illness"];

const MatchingPage = () => {
  const [distance, setDistance] = useState([5]);
  const [ageMin, setAgeMin] = useState("20");
  const [ageMax, setAgeMax] = useState("35");

  return (
    <div className="min-h-screen py-10">
      <div className="container max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold">Find Your Match</h1>
          <p className="text-muted-foreground mt-1">
            Explore potential connections and refine your search with these filter options:
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 space-y-6">
          {/* Partner Type */}
          <Field label="What type of partner are you looking for?">
            <SelectField options={partnerTypes} defaultValue="Cute, Humble" />
          </Field>

          {/* Purpose */}
          <Field label="Purpose">
            <SelectField options={purposes} defaultValue="Make New Friends" />
          </Field>

          {/* Gender */}
          <Field label="Preferred Gender">
            <SelectField options={genders} defaultValue="Woman" />
          </Field>

          {/* Age */}
          <Field label="Age Range">
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                className="w-20 bg-background border border-input rounded-lg px-3 py-2 text-sm"
                min="18"
                max="99"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="number"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                className="w-20 bg-background border border-input rounded-lg px-3 py-2 text-sm"
                min="18"
                max="99"
              />
            </div>
          </Field>

          {/* Languages */}
          <Field label="Languages">
            <SelectField options={languages} defaultValue="English, French, Bengali" />
          </Field>

          {/* Location */}
          <Field label="Location">
            <div className="flex items-center gap-2 bg-background border border-input rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <input type="text" defaultValue="Florida, US" className="bg-transparent text-sm flex-1 outline-none" placeholder="Enter location" />
            </div>
          </Field>

          {/* Disability Type */}
          <Field label="Your Disability Type">
            <SelectField options={disabilityTypes} defaultValue="Colour Blind" />
          </Field>

          {/* Distance */}
          <Field label="Distance Range">
            <div className="space-y-3">
              <Slider
                value={distance}
                onValueChange={setDistance}
                max={50}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 km</span>
                <span className="font-semibold text-foreground">{distance[0]} km</span>
                <span>50 km</span>
              </div>
            </div>
          </Field>

          <button className="text-sm text-primary hover:underline w-full text-center">
            Advance Filter Options
          </button>

          <Button variant="hero" className="w-full" size="lg">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium mb-1.5">{label}</label>
    {children}
  </div>
);

const SelectField = ({ options, defaultValue }: { options: string[]; defaultValue: string }) => (
  <select
    defaultValue={defaultValue}
    className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-ring focus:outline-none"
  >
    {options.map((o) => (
      <option key={o} value={o}>{o}</option>
    ))}
  </select>
);

export default MatchingPage;
