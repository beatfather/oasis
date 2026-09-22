import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import ReadState from './ReadState.vue'
import RocketSpace from './components/RocketSpace.vue'
import StoneFall from './components/StoneFall.vue'
import HumilityStory from './components/HumilityStory.vue'
import ImportAI from './components/ImportAI.vue'
import './read-state.css'
import './cite.css'
import './sidebar.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(ReadState)
    })
  },
  enhanceApp({ app }) {
    app.component('RocketSpace', RocketSpace)
    app.component('StoneFall', StoneFall)
    app.component('HumilityStory', HumilityStory)
    app.component('ImportAI', ImportAI)
  }
}
