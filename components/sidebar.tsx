
export default function Sidebar() {
  const steps = [
    { number: 1, title: "Topic Selection", active: true },
    { number: 2, title: "Simple Explanation", active: false },
    { number: 3, title: "Explanation Feedback", active: false },
    { number: 4, title: "Create Analogy", active: false },
    { number: 5, title: "Analogy Feedback", active: false },
    { number: 6, title: "Review & Summary", active: false },
  ]

  return (
    <div className="w-[410px] border-r border-gray-200 p-6 bg-white">
      <h1 className="text-2xl font-bold mb-8">AdaptEd</h1>

      <div className="mb-8">
        <h2 className="text-sm font-medium mb-4">Progress</h2>
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex items-center gap-3 p-4 rounded-md border ${step.active ? "bg-gray-50" : "bg-white"}`}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-300 text-xs">
                {step.number}
              </div>
              <span className="text-sm">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-4">Supplemental Files</h2>
        <div className="border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2">

          </div>
          <p className="text-sm text-gray-500">Drag and drop your files to personalize your learning</p>
        </div>
      </div>
    </div>
  )
}
