"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  Mic,
  Send,
  Bike,
  Car,
  Tag,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Loader2,
  ArrowRight,
  ExternalLink,
  Phone,
  Clock,
  MapPin,
  Check,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { BikeItem, Ride, Listing } from "@/lib/data-service";

interface ServiceItem {
  id: string;
  name: string;
  rate: string;
  location: string;
  schedule: string;
  provider: string;
  phone: string;
  notes?: string;
  verified?: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  chips?: string[];
  optionsType?: "bike" | "ride" | "listing" | "service" | "community" | "profile";
  bikeOptions?: BikeItem[];
  rideOptions?: Ride[];
  listingOptions?: Listing[];
  serviceOptions?: ServiceItem[];
  communityOptions?: any[];
  profileOptions?: any[];
  actionDone?: { [id: string]: boolean };
}

export default function StudentAssistantPage() {
  const [inputText, setInputText] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
          content: data.reply || "Here is what I found on campus:",
          chips: data.chips || [],
          optionsType: data.optionsType,
          bikeOptions: data.bikes || [],
          rideOptions: data.rides || [],
          listingOptions: data.listings || [],
          serviceOptions: data.services || [],
          communityOptions: data.communities || [],
          profileOptions: data.profiles || [],
          actionDone: {},
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I checked campus records for you. You can browse active campus carpools, bike rentals, student services, or marketplace items directly.",
          chips: ["Commute Rides", "Campus Services", "Bike Rentals", "Marketplace"],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const markActionDone = (msgIdx: number, itemId: string) => {
    setMessages((prev) =>
      prev.map((m, idx) => {
        if (idx !== msgIdx) return m;
        return {
          ...m,
          actionDone: { ...(m.actionDone || {}), [itemId]: true },
        };
      })
    );
  };

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 select-none transition-colors">
        {/* Header */}
        <header className="flex items-center gap-2 px-4 py-3 flex-none bg-white dark:bg-[#121215] border-b border-zinc-200 dark:border-zinc-800 transition-colors">
          <Link
            href="/"
            aria-label="Close"
            className="w-9 h-9 -ml-1 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={20} className="stroke-[2px]" />
          </Link>
          <div className="flex-1 font-bold text-base tracking-tight text-zinc-950 dark:text-white flex items-center gap-1.5">
            <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span>Campus AI Assistant</span>
          </div>
          <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-semibold bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        </header>

        {/* Scrollable Conversation */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto my-auto">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                <Sparkles size={22} />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-zinc-950 dark:text-white tracking-tight">
                  Campus Search Assistant
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
                  Ask in plain English or Urdu if someone is going somewhere, look for items to buy, rent a bike, or find student services.
                </p>
              </div>

              <div className="w-full pt-2 space-y-2">
                <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-left pl-1">
                  Quick searches
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    "Is anyone going to Khurrialwala today?",
                    "Can I rent a bicycle or Honda tomorrow?",
                    "Looking for a room cooler or textbook to buy",
                    "Anyone offering laundry pickup or printer repair?",
                  ].map((suggestion, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => handleSendMessage(suggestion)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all shadow-2xs hover:shadow-xs flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate">{suggestion}</span>
                      <ArrowRight size={13} className="text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="space-y-2.5">
                {msg.role === "user" ? (
                  <div className="self-end ml-auto max-w-[85%] sm:max-w-[320px] p-3.5 rounded-2xl rounded-tr-xs bg-zinc-950 dark:bg-emerald-600 text-white text-[13.5px] leading-relaxed shadow-xs font-medium">
                    {msg.content}
                  </div>
                ) : (
                  <div className="space-y-3 max-w-[95%] sm:max-w-[420px]">
                    {/* Entity Chips */}
                    {msg.chips && msg.chips.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {msg.chips.map((chip, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 text-xs font-semibold"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* AI Response Text */}
                    <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white dark:bg-[#18181b] border border-zinc-200/90 dark:border-zinc-800 text-[13.5px] leading-relaxed text-zinc-800 dark:text-zinc-200 shadow-2xs">
                      {msg.content}
                    </div>

                    {/* 1. RIDE CARDS */}
                    {msg.optionsType === "ride" && msg.rideOptions && msg.rideOptions.length > 0 && (
                      <div className="space-y-2.5 pt-1">
                        <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Available Commute Rides ({msg.rideOptions.length})
                        </div>
                        {msg.rideOptions.map((ride) => {
                          const isDone = msg.actionDone?.[ride.id];
                          return (
                            <div
                              key={ride.id}
                              className="p-3.5 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs hover:border-emerald-500/40 transition-all space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <Car size={16} />
                                  </div>
                                  <div>
                                    <div className="text-[13px] font-bold text-zinc-950 dark:text-white">
                                      {ride.from_location} → {ride.to_location}
                                    </div>
                                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                      <Clock size={11} />
                                      <span>{ride.departure_time}</span>
                                      <span>•</span>
                                      <span>{ride.organizer_name}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[14px] font-black text-zinc-950 dark:text-white">
                                    Rs. {ride.price_per_seat}
                                  </div>
                                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                    {ride.available_seats} seat{ride.available_seats !== 1 ? "s" : ""} left
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                                <Button
                                  type="button"
                                  onClick={() => markActionDone(idx, ride.id)}
                                  disabled={isDone}
                                  className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    isDone
                                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                                  }`}
                                >
                                  {isDone ? (
                                    <span className="flex items-center gap-1.5">
                                      <Check size={13} /> Ride Requested
                                    </span>
                                  ) : (
                                    "Request Ride"
                                  )}
                                </Button>
                                <Link
                                  href={`/commute/ride?id=${ride.id}`}
                                  className="h-8 px-3 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 transition-colors"
                                >
                                  <span>Details</span>
                                  <ExternalLink size={12} />
                                </Link>
                              </div>

                              {isDone && (
                                <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg flex items-center gap-1.5">
                                  <CheckCircle2 size={13} />
                                  <span>Request sent to {ride.organizer_name}! Pay Rs. {ride.price_per_seat} in cash.</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 2. BIKE CARDS */}
                    {msg.optionsType === "bike" && msg.bikeOptions && msg.bikeOptions.length > 0 && (
                      <div className="space-y-2.5 pt-1">
                        <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Available Bikes For Rent ({msg.bikeOptions.length})
                        </div>
                        {msg.bikeOptions.map((bike) => {
                          const isDone = msg.actionDone?.[bike.id];
                          return (
                            <div
                              key={bike.id}
                              className="p-3.5 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs hover:border-emerald-500/40 transition-all space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <Bike size={16} />
                                  </div>
                                  <div>
                                    <div className="text-[13px] font-bold text-zinc-950 dark:text-white">
                                      {bike.model}
                                    </div>
                                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                      <span>{bike.owner_name}</span>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5 text-zinc-800 dark:text-zinc-200 font-medium">
                                        <ShieldCheck size={11} className="text-emerald-500" />
                                        Verified
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[14px] font-black text-zinc-950 dark:text-white">
                                    Rs. {bike.daily_rate}
                                  </div>
                                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">per day</div>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                                <Button
                                  type="button"
                                  onClick={() => markActionDone(idx, bike.id)}
                                  disabled={isDone}
                                  className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    isDone
                                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                                      : "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100"
                                  }`}
                                >
                                  {isDone ? (
                                    <span className="flex items-center gap-1.5">
                                      <Check size={13} /> Rent Requested
                                    </span>
                                  ) : (
                                    "Rent Bike"
                                  )}
                                </Button>
                                <Link
                                  href={`/commute/bike?id=${bike.id}`}
                                  className="h-8 px-3 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 transition-colors"
                                >
                                  <span>Details</span>
                                  <ExternalLink size={12} />
                                </Link>
                              </div>

                              {isDone && (
                                <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg flex items-center gap-1.5">
                                  <CheckCircle2 size={13} />
                                  <span>Rental request sent to {bike.owner_name}! Pay cash at handover.</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 3. MARKETPLACE CARDS */}
                    {msg.optionsType === "listing" && msg.listingOptions && msg.listingOptions.length > 0 && (
                      <div className="space-y-2.5 pt-1">
                        <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Marketplace Items ({msg.listingOptions.length})
                        </div>
                        {msg.listingOptions.map((item) => {
                          const isDone = msg.actionDone?.[item.id];
                          return (
                            <div
                              key={item.id}
                              className="p-3.5 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs hover:border-emerald-500/40 transition-all space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                    <Tag size={16} />
                                  </div>
                                  <div>
                                    <div className="text-[13px] font-bold text-zinc-950 dark:text-white line-clamp-1">
                                      {item.title}
                                    </div>
                                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                      <span>{item.category || "Item"}</span>
                                      <span>•</span>
                                      <span>Seller: {item.seller_name}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[14px] font-black text-zinc-950 dark:text-white">
                                    Rs. {item.price}
                                  </div>
                                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                    {item.condition || "Used"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                                <Button
                                  type="button"
                                  onClick={() => markActionDone(idx, item.id)}
                                  disabled={isDone}
                                  className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    isDone
                                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                                  }`}
                                >
                                  {isDone ? (
                                    <span className="flex items-center gap-1.5">
                                      <Check size={13} /> Buy Request Sent
                                    </span>
                                  ) : (
                                    "Request to Buy"
                                  )}
                                </Button>
                                <Link
                                  href={`/market?id=${item.id}`}
                                  className="h-8 px-3 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 transition-colors"
                                >
                                  <span>Details</span>
                                  <ExternalLink size={12} />
                                </Link>
                              </div>

                              {isDone && (
                                <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg flex items-center gap-1.5">
                                  <CheckCircle2 size={13} />
                                  <span>Contact requested with {item.seller_name}! Direct cash on delivery.</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 4. CAMPUS STUDENT SERVICE CARDS */}
                    {msg.optionsType === "service" && msg.serviceOptions && msg.serviceOptions.length > 0 && (
                      <div className="space-y-2.5 pt-1">
                        <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Campus Student Services ({msg.serviceOptions.length})
                        </div>
                        {msg.serviceOptions.map((svc) => {
                          const isDone = msg.actionDone?.[svc.id];
                          return (
                            <div
                              key={svc.id}
                              className="p-3.5 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs hover:border-emerald-500/40 transition-all space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                    <Wrench size={16} />
                                  </div>
                                  <div>
                                    <div className="text-[13px] font-bold text-zinc-950 dark:text-white">
                                      {svc.name}
                                    </div>
                                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                      <span>By {svc.provider}</span>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5 text-zinc-800 dark:text-zinc-200 font-medium">
                                        <ShieldCheck size={11} className="text-emerald-500" />
                                        Verified
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[14px] font-black text-emerald-600 dark:text-emerald-400">
                                    {svc.rate}
                                  </div>
                                </div>
                              </div>

                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex flex-wrap gap-2">
                                {svc.schedule && (
                                  <span className="flex items-center gap-1">
                                    <Clock size={11} /> {svc.schedule}
                                  </span>
                                )}
                                {svc.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={11} /> {svc.location}
                                  </span>
                                )}
                              </div>

                              <div className="flex gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                                <Button
                                  type="button"
                                  onClick={() => markActionDone(idx, svc.id)}
                                  disabled={isDone}
                                  className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    isDone
                                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                                  }`}
                                >
                                  {isDone ? (
                                    <span className="flex items-center gap-1.5">
                                      <Check size={13} /> Service Requested
                                    </span>
                                  ) : (
                                    "Request Service"
                                  )}
                                </Button>
                                <Link
                                  href="/services"
                                  className="h-8 px-3 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 transition-colors"
                                >
                                  <span>All Services</span>
                                  <ExternalLink size={12} />
                                </Link>
                              </div>

                              {isDone && (
                                <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg flex items-center gap-1.5">
                                  <CheckCircle2 size={13} />
                                  <span>Service request sent to {svc.provider}! Settle directly in cash upon completion.</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl w-fit text-xs font-medium text-zinc-600 dark:text-zinc-400 shadow-2xs">
              <Loader2 size={14} className="animate-spin text-emerald-600 dark:text-emerald-400" />
              <span>Searching live campus database...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Bottom Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] flex items-center gap-2 flex-none transition-colors"
        >
          <input
            aria-label="Ask for a ride, bike, item or service"
            placeholder="Ask if someone is going somewhere, bike to rent, item, service..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 min-w-0 h-10 px-3 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-zinc-50 dark:bg-[#18181b] focus:outline-hidden focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
          />
          <Link
            href="/voice"
            aria-label="Ask by Urdu voice"
            className="md:hidden w-10 h-10 shrink-0 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-[#18181b] text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <Mic size={18} className="stroke-[2px]" />
          </Link>
          <button
            type="submit"
            aria-label="Send"
            disabled={isLoading || !inputText.trim()}
            className="w-10 h-10 shrink-0 rounded-lg bg-zinc-950 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </MobileShell>
  );
}
