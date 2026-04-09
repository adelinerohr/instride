import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/org/$slug/(authenticated)/portal/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/org/$slug/(authenticated)/portal/"!</div>
}
