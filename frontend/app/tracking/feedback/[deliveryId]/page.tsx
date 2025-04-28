"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { BASE_URL_DELIVERIES } from "@/lib/constants/Base_url";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackPage({ params }: { params: { deliveryId: string } }) {
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === null) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${BASE_URL_DELIVERIES}/api/deliveries/${params.deliveryId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comments,
        }),
      });

    

      toast.success("Thank you for your feedback!");
      router.push("/");
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
        toast.success("Thank you for your feedback!");
        router.push("/");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Rate Your Delivery</CardTitle>
          <p className="text-muted-foreground text-center">
            How was your delivery experience?
          </p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-lg">Delivery Rating</Label>
              <RadioGroup 
                className="flex justify-between py-4"
                onValueChange={(value) => setRating(parseInt(value))}
                required
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="flex flex-col items-center">
                    <RadioGroupItem 
                      value={star.toString()} 
                      id={`star-${star}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`star-${star}`}
                      className="flex flex-col items-center hover:cursor-pointer"
                    >
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        ${rating === star 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary text-secondary-foreground"}
                        peer-focus-visible:ring-2 peer-focus-visible:ring-ring
                      `}>
                        {star}
                      </div>
                      <span className="text-xs mt-1">
                        {star === 1 ? "Poor" : 
                         star === 2 ? "Fair" :
                         star === 3 ? "Good" :
                         star === 4 ? "Very Good" : "Excellent"}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Additional Comments</Label>
              <Textarea
                id="comments"
                placeholder="Tell us about your experience (optional)"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || rating === null}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}