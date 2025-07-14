"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic } from "lucide-react"

export default function CreateAnalogyPage() {
  const [analogyText, setAnalogyText] = useState("")
  const isEvaluateDisabled = analogyText.trim() === ""

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 px-12 py-16">
        <h1 className="text-4xl font-bold mb-12 text-center">Create an Analogy</h1>

        <p className="mb-4 text-sm">Compare Ohm’s Law to something everyday.</p>

        {/* Dropdown placeholder (optional template) */}
        <div className="mb-6">
          <select
            className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm"
            defaultValue=""
          >
            <option value="" disabled>Choose an analogy template (optional)</option>
            <option value="water">Water flowing through a pipe</option>
            <option value="traffic">Cars on a road</option>
            <option value="people">People entering a building</option>
          </select>
        </div>

        {/* Analogy input */}
        <div className="relative mb-10">
          <Input
            className="pl-4 pr-12 py-6 text-base rounded-lg"
            placeholder="Input your analogy here..."
            value={analogyText}
            onChange={(e) => setAnalogyText(e.target.value)}
          />
          <Button variant="ghost" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2">
            <Mic className="h-5 w-5 text-gray-400" />
          </Button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>← Back</Button>
          <Button
            className="bg-black text-white hover:bg-gray-900"
            disabled={isEvaluateDisabled}
          >
            Evaluate →
          </Button>
        </div>
      </div>
    </div>
  )
}
