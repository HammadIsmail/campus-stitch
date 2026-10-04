"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  Mic,
  Send,
  Bike,
  Car,
  Package,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { DataService, BikeItem, Ride, Listing } from "@/lib/data-service";

interface Message {
  role: "user" | "assistant";
  content: string;
  chips?: string[];
  optionsType?: "bike" | "ride" | "listing";
  bikeOptions?: BikeItem[];
  rideOptions?: Ride[];
  listingOptions?: Listing[];
  selectedOptionId?: string;
  confirmed?: boolean;
}

export default function StudentAssistantPage() {
  const [inputText, setInputText] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [availableBikes, setAvailableBikes] = React.useState<BikeItem[]>([]);
  const [availableRides, setAvailableRides] = React.useState<Ride[]>([]);

  React.useEffect(() => {
    async function loadData() {
      const [bikes, rides] = await Promise.all([
        DataService.getBikes(),
        DataService.getRides(),
      ]);
      setAvailableBikes(bikes);
      setAvailableRides(rides);
    }
    loadData();
  }, []);

  const handleSendMessage = async (text: string) => {
    const query = text.trim();
    if (!query || isLoading) return;

    const userMsg: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          chips: data.chips || [],
          optionsType: data.optionsType,
          bikeOptions: data.bikes,
          rideOptions: data.rides,
          listingOptions: data.listings,
          selectedOptionId:
            data.bikes?.[0]?.id || data.rides?.[0]?.id || undefined,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I've checked our active campus records for you. You can check rides to Khurrialwala or bike rentals on campus directly.",
          chips: ["Commute", "Bike rentals", "Marketplace"],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (msgIdx: number, optionId: string) => {
    setMessages((prev) =>
      prev.map((m, idx) =>
        idx === msgIdx ? { ...m, selectedOptionId: optionId } : m,
      ),
    );
  };

  const handleConfirm = (msgIdx: number) => {
    setMessages((prev) =>
      prev.map((m, idx) => (idx === msgIdx ? { ...m, confirmed: true } : m)),
    );
  };

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-[#F9F9FB] text-zinc-900 select-none">
        {/* Header */}
        <header className="flex items-center gap-2 px-4 py-3 flex-none bg-white border-b border-zinc-200">
          <Link
            href="/"
            aria-label="Close"
            className="w-9 h-9 -ml-1 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X size={20} className="stroke-[2px]" />
          </Link>
          <div className="flex-1 font-bold text-base tracking-tight text-black flex items-center gap-1.5">
            <Sparkles size={16} className="text-black" />
            Student Assistant
          </div>
          <span className="text-[11px] text-zinc-600 font-semibold bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-black" />
            Online
          </span>
        </header>

        {/* Scrollable Conversation */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto my-auto">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black">
                <Sparkles size={22} />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-black tracking-tight">
                  Campus Search Assistant
                </h2>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
                  Search across campus carpools, bike rentals, student marketplace, and UET discussion communities.
                </p>
              </div>

              <div className="w-full pt-2 space-y-2">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-left pl-1">
                  Quick searches
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    "Any rides available to Khurrialwala?",
                    "Can I rent a bicycle tomorrow?",
                    "Check room coolers and study desks in marketplace",
                    "Show discussions in r/cs-uet community",
                  ].map((suggestion, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => handleSendMessage(suggestion)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-white hover:border-black text-left text-xs font-semibold text-zinc-800 transition-all shadow-2xs hover:shadow-xs flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate">{suggestion}</span>
                      <ArrowRight size={13} className="text-zinc-400 group-hover:text-black group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
            <div key={idx} className="space-y-2.5">
              {msg.role === "user" ? (
                <div className="self-end ml-auto max-w-[300px] p-3.5 rounded-2xl rounded-tr-xs bg-black text-white text-[13.5px] leading-relaxed shadow-xs font-medium">
                  {msg.content}
                </div>
              ) : (
                <div className="space-y-3 max-w-[350px]">
                  {/* Entity Chips */}
                  {msg.chips && msg.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {msg.chips.map((chip, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white border border-zinc-200/90 text-[13.5px] leading-relaxed text-zinc-800 shadow-2xs">
                    {msg.content}
                  </div>

                  {/* Bike Options */}
                  {msg.optionsType === "bike" && (
                    <div className="space-y-2 pt-1">
                      {availableBikes.map((bike) => {
                        const isSelected = msg.selectedOptionId === bike.id;
                        return (
                          <div
                            key={bike.id}
                            onClick={() => handleSelectOption(idx, bike.id)}
                            className={`flex items-center gap-3 p-3.5 bg-white rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? "border-2 border-black shadow-xs"
                                : "border border-zinc-200 hover:border-zinc-400"
                            }`}
                          >
                            <div className="w-12 h-12 shrink-0 rounded-lg bg-zinc-100 border border-zinc-200 flex flex-col items-center justify-center text-xs text-zinc-600">
                              <Bike size={20} className="text-black" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[14px] font-bold text-black">
                                {bike.model}
                              </div>
                              <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                                <span>{bike.owner_name}</span>
                                <span>·</span>
                                <span className="text-black font-semibold flex items-center gap-0.5">
                                  <ShieldCheck
                                    size={11}
                                    className="stroke-[2.5px]"
                                  />
                                  Verified
                                </span>
                              </div>
                            </div>
                            <div className="text-[15px] font-extrabold text-black">
                              Rs. {bike.daily_rate}
                            </div>
                          </div>
                        );
                      })}

                      {/* Staged Confirmation Card */}
                      <div className="p-3.5 bg-white border border-zinc-200 rounded-xl space-y-2.5 shadow-2xs">
                        {(() => {
                          const chosen =
                            availableBikes.find(
                              (b) => b.id === msg.selectedOptionId,
                            ) || availableBikes[0];
                          return (
                            <>
                              <div className="text-[13px] leading-relaxed text-zinc-800">
                                You’re requesting <b>{chosen?.model}</b> from{" "}
                                {chosen?.owner_name} for{" "}
                                <b className="text-black">
                                  Rs. {chosen?.daily_rate}
                                </b>{" "}
                                tomorrow.
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleConfirm(idx)}
                                  disabled={msg.confirmed}
                                  className="flex-1 h-10 rounded-lg text-xs font-bold bg-black hover:bg-zinc-800 text-white"
                                >
                                  {msg.confirmed
                                    ? "Confirmed ✓"
                                    : "Confirm request"}
                                </Button>
                                <Link
                                  href="/commute/bike"
                                  className="h-10 px-3.5 border border-zinc-300 rounded-lg text-xs font-semibold text-black hover:bg-zinc-100 flex items-center justify-center transition-colors"
                                >
                                  Details
                                </Link>
                              </div>
                              {msg.confirmed ? (
                                <div className="text-xs font-semibold text-black bg-zinc-100 border border-zinc-200 p-2 rounded-lg flex items-center gap-1.5">
                                  <CheckCircle2 size={14} />
                                  Request sent to {chosen?.owner_name}!
                                </div>
                              ) : null}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Ride Options */}
                  {msg.optionsType === "ride" && (
                    <div className="space-y-2 pt-1">
                      {availableRides.map((ride) => (
                        <Link
                          key={ride.id}
                          href={`/commute/ride?id=${ride.id}`}
                          className="flex items-center gap-3 p-3.5 bg-white border border-zinc-200 rounded-xl shadow-2xs hover:border-black transition-all block"
                        >
                          <div className="w-12 text-[15px] font-extrabold text-black">
                            {ride.departure_time}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-bold text-black">
                              {ride.from_location} → {ride.to_location}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {ride.organizer_name} ·{" "}
                              <span className="text-black font-semibold">
                                {ride.available_seats} seats left
                              </span>
                            </div>
                          </div>
                          <div className="text-[14px] font-extrabold text-black">
                            Rs. {ride.price_per_seat}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-white border border-zinc-200 rounded-2xl w-fit text-xs font-medium text-zinc-600 shadow-2xs">
              <Loader2 size={14} className="animate-spin text-black" />
              <span>Checking campus network...</span>
            </div>
          )}
        </main>

        {/* Bottom Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="p-3 border-t border-zinc-200 bg-white flex items-center gap-2 flex-none"
        >
          <input
            aria-label="Ask for a ride, bike, item or event"
            placeholder="Ask for a ride, bike rental, item..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 min-w-0 h-10 px-3 border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black"
          />
          <Link
            href="/voice"
            aria-label="Ask by Urdu voice"
            className="md:hidden w-10 h-10 shrink-0 border border-zinc-300 rounded-lg bg-white text-zinc-800 hover:bg-zinc-100 flex items-center justify-center transition-colors"
          >
            <Mic size={18} className="stroke-[2px]" />
          </Link>
          <button
            type="submit"
            aria-label="Send"
            disabled={isLoading || !inputText.trim()}
            className="w-10 h-10 shrink-0 rounded-lg bg-black hover:bg-zinc-800 disabled:opacity-40 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </MobileShell>
  );
}
