import { useState } from "react";
import { Mic, Play, Circle, SkipForward, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface PracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  module?: {
    title: string;
    type: string;
    exercises: any[];
  };
}

export function PracticeModal({ isOpen, onClose, module }: PracticeModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);

  if (!module) return null;

  const handleStartRecording = () => {
    setIsRecording(true);
    // In a real app, implement WebRTC audio recording here
    setTimeout(() => {
      setIsRecording(false);
    }, 3000); // Simulate 3-second recording
  };

  const handleNextExercise = () => {
    if (currentExercise < module.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      onClose();
    }
  };

  const progress = ((currentExercise + 1) / module.exercises.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {module.title} - Session
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          {module.type === "speaking" && (
            <div className="text-center mb-8">
              <div className="w-32 h-32 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-6 flex items-center justify-center">
                <Mic className="text-white w-12 h-12" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Pronunciation Exercise: Vowel Sounds
              </h4>
              <p className="text-muted-foreground mb-6">
                Read the following words aloud, focusing on clear vowel pronunciation
              </p>

              <div className="bg-muted rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-lg font-medium text-foreground">
                  {["beat", "bit", "bet", "bat", "boat", "but", "boot", "bought"].map((word) => (
                    <span key={word} className="p-2 bg-card rounded border">
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={handleStartRecording}
                  disabled={isRecording}
                  className={`px-6 py-3 rounded-full ${
                    isRecording
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white`}
                >
                  <Circle className="mr-2 w-4 h-4" fill="currentColor" />
                  {isRecording ? "Recording..." : "Start Recording"}
                </Button>
                <Button variant="outline" className="px-6 py-3 rounded-full">
                  <Play className="mr-2 w-4 h-4" />
                  Listen Example
                </Button>
              </div>
            </div>
          )}

          {module.type === "writing" && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Essay Writing Exercise
              </h4>
              <p className="text-muted-foreground mb-4">
                Write a 300-word argumentative essay on the following topic:
              </p>
              <div className="bg-muted p-4 rounded-lg mb-6">
                <p className="font-medium text-foreground">
                  "Technology has made learning more accessible but less personal. Discuss."
                </p>
              </div>
              <textarea
                className="w-full h-40 p-4 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Start writing your essay here..."
              />
            </div>
          )}

          {module.type === "reading" && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Reading Comprehension
              </h4>
              <div className="bg-muted p-6 rounded-lg mb-6">
                <h5 className="font-semibold mb-3">Article: "The Future of Remote Work"</h5>
                <p className="text-sm leading-relaxed">
                  The global shift towards remote work has fundamentally changed how we think about 
                  professional life. Companies worldwide have discovered that productivity can be 
                  maintained, and in many cases improved, when employees work from home. This 
                  transformation has led to new challenges and opportunities in workplace culture, 
                  technology adoption, and work-life balance...
                </p>
              </div>
              <div className="space-y-4">
                <div className="border border-border p-4 rounded-lg">
                  <p className="font-medium mb-2">Question 1: What is the main topic of this article?</p>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="q1" className="mr-2" />
                      The benefits of working from home
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="q1" className="mr-2" />
                      Changes in professional life due to remote work
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="q1" className="mr-2" />
                      Technology challenges in remote work
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Progress: {currentExercise + 1} of {module.exercises.length} exercises
              </span>
              <Progress value={progress} className="w-32" />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Skip
              </Button>
              <Button onClick={handleNextExercise} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <SkipForward className="mr-2 w-4 h-4" />
                Next Exercise
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
