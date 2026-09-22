<script setup lang="ts">
</script>

<template>
  <figure class="stone-fall">
    <svg viewBox="0 0 800 260" aria-hidden="true">
      <rect width="800" height="260" fill="#10151c" />
      <line class="ground" x1="0" y1="198" x2="800" y2="198" />
      <g class="dust">
        <circle cx="392" cy="196" r="3" />
        <circle cx="408" cy="194" r="2.2" />
        <circle cx="378" cy="195" r="1.6" />
      </g>
      <g class="stone">
        <path d="M400 148 L428 166 L418 194 L386 198 L362 176 L374 154 Z" />
      </g>
    </svg>
  </figure>
</template>

<style scoped>
.stone-fall {
  margin: 0.35rem 0 1.15rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: #10151c;
}

.stone-fall svg {
  display: block;
  width: 100%;
  height: auto;
}

.ground {
  stroke: rgba(232, 226, 214, 0.45);
  stroke-width: 1.5;
}

.stone path {
  fill: #b7b1a6;
}

.stone {
  animation: fall 9s cubic-bezier(0.45, 0, 0.75, 0.4) infinite;
}

.dust circle {
  fill: rgba(232, 226, 214, 0.55);
  opacity: 0;
  animation: puff 9s ease-out infinite;
}

@keyframes fall {
  0% {
    transform: translateY(-150px);
  }
  16% {
    transform: translateY(0);
  }
  20% {
    transform: translateY(-10px);
  }
  24%,
  100% {
    transform: translateY(0);
  }
}

@keyframes puff {
  0%,
  15% {
    opacity: 0;
    transform: translateY(0);
  }
  18% {
    opacity: 0.7;
  }
  32%,
  100% {
    opacity: 0;
    transform: translateY(-8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stone,
  .dust circle {
    animation: none;
  }
}
</style>
