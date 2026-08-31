import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router";
import {
  HiOutlineClipboardDocumentList,
  HiOutlineUserGroup,
  HiOutlineQrCode,
  HiOutlineBolt,
} from "react-icons/hi2";
import { useAppSelector } from "../app/hooks";
import { HeroCanvas } from "../components/three/HeroCanvas";
import { StatusFlowRail } from "../components/StatusFlowRail";
import { prefersReducedMotion } from "../lib/motion";
import { gsap } from "../lib/gsap";
import type { DeliveryStatus } from "../types";

const LIFECYCLE: { status: DeliveryStatus; copy: string }[] = [
  { status: "OPEN", copy: "A retailer logs the request — customer, address, item. No phone call needed." },
  { status: "ASSIGNED", copy: "A dispatcher assigns it to a rider in one click, from a real-time board." },
  { status: "PICKED_UP", copy: "The rider marks it collected — visible to the retailer instantly." },
  { status: "IN_TRANSIT", copy: "Status updates as it moves. No one has to ask \"where is it?\"" },
  { status: "DELIVERED", copy: "The rider scans (or types) the confirmation code. Proof, on record." },
];

const SERVICES = [
  {
    icon: HiOutlineClipboardDocumentList,
    role: "Retailers",
    headline: "Log a delivery in seconds",
    points: [
      "Customer name, phone, address, item — one form",
      "Track status without another phone call",
      "A confirmation code as real proof of delivery",
    ],
  },
  {
    icon: HiOutlineUserGroup,
    role: "Dispatchers",
    headline: "Assign the right rider, instantly",
    points: [
      "See every open delivery on one board",
      "Assign with one click — no double-booking, even under load",
      "Full visibility across every rider's current jobs",
    ],
  },
  {
    icon: HiOutlineQrCode,
    role: "Riders",
    headline: "One job list, one scan to confirm",
    points: [
      "See exactly what's assigned to you and where it's going",
      "Update status as you go: picked up, in transit",
      "Confirm drop-off by QR scan, or type the code manually",
    ],
  },
];

export default function WelcomePage() {
  const token = useAppSelector((state) => state.auth.token);
  const [reduceMotion] = useState(prefersReducedMotion);
  const heroRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const lifecycleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-hero-eyebrow]", { opacity: 0, y: 16, duration: 0.6 })
        .from("[data-hero-headline]", { opacity: 0, y: 24, duration: 0.8 }, "-=0.4")
        .from("[data-hero-sub]", { opacity: 0, y: 16, duration: 0.6 }, "-=0.5")
        .from("[data-hero-cta]", { opacity: 0, y: 12, duration: 0.5 }, "-=0.4")
        .from("[data-hero-canvas]", { opacity: 0, scale: 0.96, duration: 1 }, "-=0.9");

      gsap.from("[data-service-card]", {
        opacity: 0,
        y: 32,
        duration: 0.7,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: servicesRef.current, start: "top 80%" },
      });

      gsap.from("[data-lifecycle-step]", {
        opacity: 0,
        x: -16,
        duration: 0.5,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: { trigger: lifecycleRef.current, start: "top 75%" },
      });
    }, [heroRef, servicesRef, lifecycleRef]);

    return () => ctx.revert();
  }, [reduceMotion]);

  if (token) return <Navigate to="/deliveries" replace />;

  return (
    <div className="min-h-dvh bg-base-100">
      {/* ---------- hero ---------- */}
      <section ref={heroRef} className="relative overflow-hidden bg-[#12141c] text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p data-hero-eyebrow className="font-mono text-xs uppercase tracking-[0.2em] text-[#f5a623]">
              Reflex · Delivery coordination
            </p>
            <h1 data-hero-headline className="mt-4 font-display text-4xl font-bold leading-[1.1] sm:text-5xl">
              Know exactly where every delivery stands.
            </h1>
            <p data-hero-sub className="mt-5 max-w-md text-base text-white/70">
              Reflex replaces the WhatsApp thread and the phone call with one tracked system —
              built for small Kenyan retailers, their dispatchers, and their riders.
            </p>
            <div data-hero-cta className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/login" className="btn btn-lg" style={{ backgroundColor: "#0f7a6c", color: "white", border: "none" }}>
                Sign in to Reflex
              </Link>
              <a href="#how-it-works" className="btn btn-lg btn-ghost text-white hover:bg-white/10">
                See how it works
              </a>
            </div>
            <p className="mt-6 text-xs text-white/40">
              Accounts are provisioned by your dispatcher or admin — Reflex doesn't use open self-signup.
            </p>
          </div>

        </div>
      </section>

      {/* ---------- services ---------- */}
      <section ref={servicesRef} className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">What Reflex does</p>
          <h2 className="mt-3 font-display text-3xl font-bold">One system, three roles, zero guessing.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {SERVICES.map((service) => (
            <div
              key={service.role}
              data-service-card
              className="card border border-base-300 bg-base-100 shadow-sm"
            >
              <div className="card-body gap-3">
                <service.icon className="h-8 w-8 text-primary" aria-hidden />
                <p className="font-mono text-xs uppercase tracking-wide text-base-content/50">{service.role}</p>
                <h3 className="font-display text-lg font-semibold">{service.headline}</h3>
                <ul className="mt-1 flex flex-col gap-2 text-sm text-base-content/70">
                  {service.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <HiOutlineBolt className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- lifecycle ---------- */}
      <section id="how-it-works" ref={lifecycleRef} className="bg-base-200">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-bold">
            Every delivery follows the same tracked route.
          </h2>
          <p className="mt-3 text-base-content/60">
            This is the exact status rail used throughout the real app — not a mockup.
          </p>

          <div className="mt-10 flex flex-col gap-8">
            {LIFECYCLE.map((step) => (
              <div key={step.status} data-lifecycle-step>
                <StatusFlowRail status={step.status} />
                <p className="mt-2 text-sm text-base-content/70">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- footer / cta ---------- */}
      <footer className="border-t border-base-300 bg-base-100">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-lg font-bold text-primary">Reflex</p>
            <p className="text-sm text-base-content/60">Delivery coordination, tracked end to end.</p>
          </div>
          <Link to="/login" className="btn btn-primary">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
