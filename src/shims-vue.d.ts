declare module '*.vue' {
  import { DefineComponent } from '@vue/runtime-core' // eslint-disable-line import/no-unresolved
  const component: DefineComponent<{}, {}, any>
  export default component
}
