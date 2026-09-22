<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  duration: number
}>()

const time = ref(0)
const phase = ref<'idle' | 'playing' | 'paused' | 'done'>('idle')
let frame = 0
let last = 0

function tick(now: number) {
  if (!last) last = now
  time.value = Math.min(props.duration, time.value + (now - last) / 1000)
  last = now
  if (time.value >= props.duration) {
    phase.value = 'done'
    frame = 0
    return
  }
  frame = requestAnimationFrame(tick)
}

function play() {
  if (phase.value === 'done' || time.value >= props.duration) time.value = 0
  phase.value = 'playing'
  last = 0
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(tick)
}

function pause() {
  phase.value = 'paused'
  cancelAnimationFrame(frame)
  frame = 0
  last = 0
}

function toggle() {
  if (phase.value === 'playing') pause()
  else play()
}

function seekTo(ratio: number) {
  const next = Math.min(props.duration, Math.max(0, ratio) * props.duration)
  time.value = next
  if (next >= props.duration) {
    pause()
    phase.value = 'done'
    time.value = props.duration
    return
  }
  if (phase.value === 'playing') last = 0
  else phase.value = 'paused'
}

function ratioFrom(event: PointerEvent, el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0) return 0
  return (event.clientX - rect.left) / rect.width
}

function onSeekDown(event: PointerEvent) {
  const el = event.currentTarget as HTMLElement
  try {
    el.setPointerCapture(event.pointerId)
  } catch {
    // A pointer id is only capturable during a real press.
  }
  seekTo(ratioFrom(event, el))
}

function onSeekMove(event: PointerEvent) {
  const el = event.currentTarget as HTMLElement
  if (!el.hasPointerCapture(event.pointerId)) return
  seekTo(ratioFrom(event, el))
}

function nudge(step: number) {
  seekTo((time.value + step) / props.duration)
}

onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <figure class="story-stage">
    <div class="screen" @click="toggle">
      <slot :time="time" :phase="phase" />
      <button
        v-if="phase === 'idle' || phase === 'done'"
        class="play-main"
        type="button"
        @click.stop="toggle"
      >
        {{ phase === 'done' ? '再看一次' : '播放' }}
      </button>
      <button v-else class="play-side" type="button" @click.stop="toggle">
        {{ phase === 'playing' ? '暂停' : '继续' }}
      </button>
      <div
        class="progress"
        role="slider"
        tabindex="0"
        aria-label="进度"
        :aria-valuemin="0"
        :aria-valuemax="duration"
        :aria-valuenow="Math.round(time)"
        @click.stop
        @pointerdown="onSeekDown"
        @pointermove="onSeekMove"
        @keydown.left.prevent="nudge(-1)"
        @keydown.right.prevent="nudge(1)"
      >
        <span class="track">
          <i :style="{ width: `${Math.min(100, (time / duration) * 100)}%` }" />
        </span>
      </div>
    </div>
    <figcaption>
      <slot name="caption" :time="time" :phase="phase" />
    </figcaption>
  </figure>
</template>

<style scoped>
.story-stage {
  margin: 1.15rem 0 1.5rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: #10151c;
}

.screen {
  position: relative;
  cursor: pointer;
}

.screen :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}

.play-main,
.play-side {
  border: 0;
  font: inherit;
  cursor: pointer;
}

.play-main {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  padding: 0.55rem 1.15rem;
  background: #e6a817;
  color: #1b1404;
  font-size: 0.95rem;
}

.play-side {
  position: absolute;
  right: 0.75rem;
  bottom: 1.15rem;
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  background: rgba(16, 21, 28, 0.82);
  color: #f3efe6;
  font-size: 0.82rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 18px;
  display: flex;
  align-items: flex-end;
  cursor: pointer;
  touch-action: none;
}

.track {
  position: relative;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
}

.track i {
  display: block;
  height: 100%;
  background: #e6a817;
  position: relative;
}

.track i::after {
  content: '';
  position: absolute;
  right: -5px;
  top: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e6a817;
  transform: translateY(-50%);
}

figcaption {
  margin: 0;
  padding: 0.55rem 0.95rem 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(232, 226, 214, 0.74);
  font-size: 0.88rem;
  line-height: 1.55;
}
</style>
