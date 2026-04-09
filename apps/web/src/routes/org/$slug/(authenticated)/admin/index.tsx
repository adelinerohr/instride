import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/org/$slug/(authenticated)/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/org/$slug/(authenticated)/admin/"!</div>
}
