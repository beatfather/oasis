<script setup lang="ts">
import RocketGlyph from './RocketGlyph.vue'

const stars = Array.from({ length: 54 }, (_, i) => {
  const x = Math.sin(i * 12.9898) * 43758.5453
  const y = Math.sin(i * 78.233) * 24634.6345
  const fx = x - Math.floor(x)
  const fy = y - Math.floor(y)
  return {
    cx: 20 + fx * 760,
    cy: 14 + fy * 250,
    r: i % 9 === 0 ? 1.8 : i % 4 === 0 ? 1.15 : 0.7,
    opacity: 0.35 + (i % 5) * 0.12,
    delay: `${(i % 11) * 0.34}s`,
    duration: `${2.6 + (i % 6) * 0.4}s`
  }
})
</script>

<template>
  <figure class="rocket-space">
    <svg viewBox="0 0 800 300" aria-hidden="true">
      <defs>
        <radialGradient id="rocket-space-bg" cx="28%" cy="72%" r="75%">
          <stop offset="0%" stop-color="#1a2740" />
          <stop offset="55%" stop-color="#0b1220" />
          <stop offset="100%" stop-color="#070b12" />
        </radialGradient>
        <radialGradient id="rocket-nebula" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#e6a817" stop-opacity="0.22" />
          <stop offset="100%" stop-color="#e6a817" stop-opacity="0" />
        </radialGradient>
        <path id="rocket-route" d="M 148 214 C 230 206, 360 156, 690 78" />
      </defs>

      <rect width="800" height="300" fill="url(#rocket-space-bg)" />
      <ellipse cx="640" cy="70" rx="150" ry="70" fill="url(#rocket-nebula)" />

      <g class="starfield">
        <circle
          v-for="(star, index) in stars"
          :key="index"
          class="star"
          :cx="star.cx"
          :cy="star.cy"
          :r="star.r"
          :opacity="star.opacity"
          :style="{ animationDelay: star.delay, animationDuration: star.duration }"
        />
      </g>

      <circle class="boundary" cx="148" cy="214" r="52" />
      <text class="boundary-label" x="148" y="286" text-anchor="middle">边界</text>
      <use class="route" href="#rocket-route" />

      <g class="rocket-flying">
        <animateMotion dur="11s" repeatCount="indefinite" rotate="auto" calcMode="linear">
          <mpath href="#rocket-route" />
        </animateMotion>
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          keyTimes="0;0.08;0.84;1"
          dur="11s"
          repeatCount="indefinite"
        />
        <RocketGlyph />
      </g>

      <g class="rocket-still" transform="translate(470 142) rotate(-18)">
        <RocketGlyph />
      </g>
    </svg>
    <figcaption>从写明的边界出发，飞进还没有结论的地方。</figcaption>
  </figure>
</template>

<style scoped>
.rocket-space {
  margin: 1.15rem 0 1.5rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: #070b12;
}

.rocket-space svg {
  display: block;
  width: 100%;
  height: auto;
}

.star {
  fill: #f6f3ea;
  animation: twinkle 3s ease-in-out infinite;
}

.starfield {
  animation: drift 70s linear infinite;
}

.boundary {
  fill: none;
  stroke: rgba(230, 168, 23, 0.85);
  stroke-width: 1.4;
  stroke-dasharray: 3 6;
}

.boundary-label {
  fill: rgba(246, 243, 234, 0.78);
  font-size: 13px;
  letter-spacing: 0.14em;
}

.route {
  fill: none;
  stroke: rgba(246, 243, 234, 0.28);
  stroke-width: 1.2;
  stroke-dasharray: 1.5 8;
  stroke-linecap: round;
}

.rocket-still {
  display: none;
}

.rocket-space :deep(.glyph) {
  transform: scale(2.15);
}

.rocket-space :deep(.body) {
  fill: #f3efe6;
}

.rocket-space :deep(.nose) {
  fill: #e6a817;
}

.rocket-space :deep(.fin) {
  fill: #c9c2b3;
}

.rocket-space :deep(.window) {
  fill: #8ec8ff;
}

.rocket-space :deep(.flame) {
  fill: #ff7a1a;
  transform-box: fill-box;
  transform-origin: 100% 50%;
  animation: flicker 0.16s ease-in-out infinite alternate;
}

.rocket-space :deep(.flame-core) {
  fill: #ffe08a;
  transform-box: fill-box;
  transform-origin: 100% 50%;
  animation: flicker 0.12s ease-in-out infinite alternate;
}

figcaption {
  margin: 0;
  padding: 0.55rem 0.95rem 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(243, 239, 230, 0.74);
  font-size: 0.88rem;
  line-height: 1.55;
}

@keyframes twinkle {
  50% {
    opacity: 0.2;
  }
}

@keyframes drift {
  to {
    transform: translate(-28px, 10px);
  }
}

@keyframes flicker {
  from {
    transform: scaleX(0.82);
  }
  to {
    transform: scaleX(1.18);
  }
}

@media (prefers-reduced-motion: reduce) {
  .star,
  .starfield,
  .rocket-space :deep(.flame),
  .rocket-space :deep(.flame-core) {
    animation: none;
  }

  .rocket-flying {
    display: none;
  }

  .rocket-still {
    display: inline;
  }
}
</style>
