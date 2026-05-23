// src/utils/gsapUtils.js
// GSAP animation presets + utilities
// Import gsap/ScrollTrigger lazily where needed

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { easing, duration } from '@styles/tokens'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

// ── CORE TIMELINE FACTORY ────────────────────────────────────────
/**
 * Creates a GSAP timeline with ORBITOPS defaults
 * @param {gsap.TimelineVars} vars
 */
export const createTimeline = (vars = {}) =>
  gsap.timeline({ defaults: { ease: easing.hudStr, duration: duration.normal }, ...vars })

// ── ENTRANCE ANIMATIONS ──────────────────────────────────────────

/** Fade + translate up */
export const revealUp = (target, vars = {}) =>
  gsap.fromTo(target,
    { y: 24, opacity: 0, filter: 'blur(4px)' },
    { y: 0,  opacity: 1, filter: 'blur(0px)',
      duration: duration.normal, ease: easing.hudStr, ...vars }
  )

/** Staggered reveal for a list of elements */
export const staggerReveal = (targets, vars = {}) =>
  gsap.fromTo(targets,
    { y: 20, opacity: 0 },
    { y: 0,  opacity: 1,
      duration: duration.normal,
      ease: easing.hudStr,
      stagger: 0.08,
      ...vars }
  )

/** HUD panel open — clip-path iris wipe */
export const hudOpen = (target, vars = {}) =>
  gsap.fromTo(target,
    { clipPath: 'inset(50% 50% 50% 50%)', opacity: 0 },
    { clipPath: 'inset(0% 0% 0% 0%)',    opacity: 1,
      duration: 0.6, ease: easing.hudStr, ...vars }
  )

/** Horizontal line draw */
export const drawLine = (target, vars = {}) =>
  gsap.fromTo(target,
    { scaleX: 0, transformOrigin: 'left center' },
    { scaleX: 1, duration: 0.8, ease: easing.cinematicStr, ...vars }
  )

/** Counter — animate a number from 0 to value */
export const animateCounter = (element, endValue, vars = {}) => {
  const obj = { val: 0 }
  return gsap.to(obj, {
    val: endValue,
    duration: duration.cinematic,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.round(obj.val).toLocaleString()
    },
    ...vars,
  })
}

// ── AMBIENT / LOOP ANIMATIONS ─────────────────────────────────────

/** Floating hover loop */
export const floatLoop = (target, amplitude = 8, dur = 6) =>
  gsap.to(target, {
    y: `-=${amplitude}`,
    duration: dur / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  })

/** Slow rotation loop */
export const rotateLoop = (target, deg = 360, dur = 30) =>
  gsap.to(target, {
    rotation: `+=${deg}`,
    duration: dur,
    ease: 'none',
    repeat: -1,
  })

/** Pulse glow on box-shadow */
export const glowPulse = (target, glowColor = 'rgba(0,212,255,0.5)', dur = 2.5) =>
  gsap.to(target, {
    boxShadow: `0 0 30px ${glowColor}, 0 0 70px ${glowColor.replace('0.5', '0.15')}`,
    duration: dur / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  })

/** Text glow pulse */
export const textGlowPulse = (target, color = 'rgba(0,212,255,0.8)', dur = 3) =>
  gsap.to(target, {
    textShadow: `0 0 16px ${color}, 0 0 40px ${color.replace('0.8', '0.3')}`,
    duration: dur / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  })

// ── SCROLL TRIGGER HELPERS ────────────────────────────────────────

/**
 * Reveal elements when they enter the viewport
 * @param {string|Element} trigger — scroll trigger element
 * @param {string|Element[]} targets — elements to animate
 */
export const scrollReveal = (trigger, targets, vars = {}) =>
  gsap.fromTo(targets,
    { y: 30, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: duration.normal,
      ease: easing.hudStr,
      stagger: 0.1,
      scrollTrigger: {
        trigger,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      ...vars,
    }
  )

// ── TRANSITION HELPERS ────────────────────────────────────────────

/** Page leave — fade + scale down */
export const pageLeave = (container) =>
  gsap.to(container, {
    opacity: 0,
    scale: 0.97,
    filter: 'blur(6px)',
    duration: 0.4,
    ease: easing.cinematicStr,
  })

/** Page enter — fade + scale up */
export const pageEnter = (container) =>
  gsap.fromTo(container,
    { opacity: 0, scale: 1.02, filter: 'blur(6px)' },
    { opacity: 1, scale: 1,    filter: 'blur(0px)',
      duration: 0.6, ease: easing.hudStr }
  )

// ── CLEANUP HELPER ────────────────────────────────────────────────
/** Kill all tweens on element (use in useEffect cleanup) */
export const killTweens = (...targets) => {
  targets.forEach(t => t && gsap.killTweensOf(t))
}