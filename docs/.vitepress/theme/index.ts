import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import ReadState from './ReadState.vue'
import './read-state.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(ReadState)
    })
  }
}
