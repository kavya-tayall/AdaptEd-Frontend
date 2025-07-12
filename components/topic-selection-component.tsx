"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import TopicChip from "@/components/topic-chip"

export default function TopicSelection() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const router = useRouter()

  const topics = [
    "Ohm's Law",
    "Kirchhoff's Laws",
    "Resistors and Resistance",
    "Capacitors",
    "Inductors",
    "Operational Amplifiers",
    "Superposition Theorem",
    "Impedance and Reactance",
    "First-Order Circuits",
    "Second-Order Circuits",
  ]

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic)
  }

  const handleProceed = () => {
    if (selectedTopic) {
      router.push("/create-analogy")
    } else {
      alert("Please select a topic before proceeding.")
    }
  }

  return (
    <div className="max-w-3xl mx-auto pt-12">
      <h1 className="text-3xl font-bold text-center mb-16">Topic Selection</h1>

      <div className="mb-8">
        <p className="text-center mb-6">
          What specific concept within Electrical Engineering do you want to master?
        </p>

        <div className="relative mb-8">
          <Input
            className="pl-4 pr-12 py-6 text-base rounded-lg"
            placeholder="Input any Electrical Engineering concept or select one below"
          />
          <Button variant="ghost" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2">
            <Mic className="h-5 w-5 text-gray-400" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <TopicChip
              key={topic}
              label={topic}
              selected={selectedTopic === topic}
              onClick={() => handleTopicSelect(topic)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          className="bg-gray-700 hover:bg-gray-800 text-white px-6"
          onClick={handleProceed}
        >
          Proceed
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  )
}
