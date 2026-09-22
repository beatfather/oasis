<script setup lang="ts">
import StoryStage from './StoryStage.vue'

const duration = 22

function smooth(value: number) {
  const p = Math.min(1, Math.max(0, value))
  return p * p * (3 - 2 * p)
}

function span(time: number, start: number, end: number) {
  return smooth((time - start) / (end - start))
}

function scene(time: number) {
  const boast = span(time, 1, 3.6)
  const attract = span(time, 3.8, 7.6)
  const toHunt = span(time, 7.8, 9.2)
  const beside = span(time, 9.2, 10.8)
  const charge = span(time, 9.4, 11.6)
  const reach = span(time, 10.8, 12.2) * (1 - span(time, 12.4, 14.2))
  const refuse = span(time, 12.4, 15)
  const fall = span(time, 15.2, 16.8)
  return { boast, attract, toHunt, beside, charge, reach, refuse, fall }
}

function caption(time: number, phase: string) {
  if (phase === 'idle') return '点播放。炫耀猎获的人，在下一次狩猎里没被救。'
  if (time < 1) return '部落里。'
  if (time < 3.8) return '他举起猎获炫耀。'
  if (time < 7.8) return '异性被这些资源吸引过去。'
  if (time < 9.4) return '下一次狩猎。'
  if (time < 12.4) return '他遇险。另一个雄性就在旁边。'
  if (time < 15.4) return '那个雄性不高兴异性被抢走，故意不救。'
  return '他死了。'
}
</script>

<template>
  <StoryStage :duration="duration">
    <template #default="{ time }">
      <svg viewBox="0 0 800 300" aria-hidden="true">
        <rect width="800" height="300" fill="#10151c" />

        <g :opacity="1 - scene(time).toHunt">
          <path class="hut" d="M70 228 L112 172 L154 228" />
          <path class="hut" d="M142 228 L180 182 L218 228" />
        </g>

        <g :opacity="scene(time).toHunt">
          <path class="grass" d="M660 228 L666 190 L672 228" />
          <path class="grass" d="M694 228 L700 184 L708 228" />
          <path class="grass" d="M728 228 L732 198 L738 228" />
          <g :transform="`translate(${820 - scene(time).charge * 130} 228)`">
            <path class="leg" d="M-6 -6 L-10 0 M8 -6 L6 0 M20 -6 L24 0" />
            <ellipse class="beast" cx="10" cy="-18" rx="32" ry="13" />
            <circle class="beast" cx="-20" cy="-26" r="10" />
            <path class="beast" d="M-26 -24 L-40 -30 L-32 -20 Z" />
            <path class="tusk" d="M-30 -22 L-38 -16" />
            <circle class="pupil" cx="-24" cy="-27" r="1.3" />
          </g>
        </g>

        <line class="ground" x1="36" y1="228" x2="764" y2="228" />

        <g
          :opacity="1 - scene(time).toHunt"
          :transform="`translate(${300 + scene(time).attract * 160} 228)`"
        >
          <path class="dress" d="M-9 -42 H9 L16 -2 H-16 Z" />
          <circle class="body" cx="0" cy="-50" r="8.5" />
          <circle class="pupil" cx="3.2" cy="-51" r="1.2" />
          <path class="arm" d="M-7 -36 L-14 -18 M7 -36 L14 -18" />
        </g>

        <g
          :transform="`translate(${220 + scene(time).beside * 220 - scene(time).refuse * 150} 228) rotate(${-12 * scene(time).refuse})`"
        >
          <path class="body" d="M-5 0 L-8 -20 L-2 -20 L0 -4 L2 -20 L8 -20 L5 0 Z" />
          <path class="body" d="M-9 -20 H9 L7 -42 H-7 Z" />
          <circle class="body" cx="0" cy="-50" r="8.5" />
          <circle class="pupil" cx="3.2" cy="-51" r="1.2" />
          <path class="arm" d="M-8 -34 L-16 -16" />
          <path
            class="arm"
            :class="{ reach: scene(time).reach > 0.2 }"
            :d="`M8 -34 L${18 + scene(time).reach * 48} ${-16 - scene(time).reach * 6}`"
          />
        </g>

        <g
          :opacity="1 - scene(time).fall"
          :transform="`translate(530 228) scale(${scene(time).toHunt > 0.55 ? 1 : -1} 1)`"
        >
          <path class="body" d="M-5 0 L-8 -20 L-2 -20 L0 -4 L2 -20 L8 -20 L5 0 Z" />
          <path class="body" d="M-9 -20 H9 L7 -42 H-7 Z" />
          <circle class="body" cx="0" cy="-50" r="8.5" />
          <circle class="pupil" cx="3.2" cy="-51" r="1.2" />
          <path
            class="arm"
            :d="`M-7 -34 L${-14 - scene(time).boast * (1 - scene(time).toHunt) * 2} ${-16 - scene(time).boast * (1 - scene(time).toHunt) * 58} M7 -34 L${14 + scene(time).boast * (1 - scene(time).toHunt) * 2} ${-16 - scene(time).boast * (1 - scene(time).toHunt) * 58}`"
          />
          <g class="goods" :opacity="scene(time).boast * (1 - scene(time).toHunt)" transform="translate(0 -86)">
            <rect x="-16" y="0" width="32" height="12" rx="2" />
            <rect x="-11" y="-10" width="22" height="10" rx="2" />
          </g>
        </g>

        <g :opacity="scene(time).fall" transform="translate(500 228)">
          <path class="arm" d="M2 -7 L20 -9 M2 -13 L22 -15" />
          <rect class="body" x="18" y="-20" width="42" height="16" rx="4" />
          <circle class="body" cx="70" cy="-13" r="10" />
          <path class="closed" d="M64 -14 H76" />
          <path class="arm" d="M24 -20 L10 -4" />
        </g>
      </svg>
    </template>
    <template #caption="{ time, phase }">
      {{ caption(time, phase) }}
    </template>
  </StoryStage>
</template>

<style scoped>
.ground {
  stroke: rgba(232, 226, 214, 0.42);
  stroke-width: 1.5;
}

.hut,
.grass {
  fill: none;
  stroke: rgba(232, 226, 214, 0.32);
  stroke-width: 1.6;
  stroke-linejoin: round;
}

.body {
  fill: #e4ddd0;
}

.dress {
  fill: #cbb99a;
}

.pupil {
  fill: #10151c;
}

.closed {
  fill: none;
  stroke: #10151c;
  stroke-width: 1.6;
  stroke-linecap: round;
}

.arm,
.leg {
  fill: none;
  stroke: #e4ddd0;
  stroke-width: 3.6;
  stroke-linecap: round;
}

.leg {
  stroke: #6d6256;
  stroke-width: 2.4;
}

.reach {
  stroke: #f3efe6;
}

.goods rect {
  fill: #e6a817;
}

.beast {
  fill: #6d6256;
}

.tusk {
  fill: none;
  stroke: #e4ddd0;
  stroke-width: 1.7;
  stroke-linecap: round;
}
</style>
