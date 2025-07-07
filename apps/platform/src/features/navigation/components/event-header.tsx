import { Typography } from '#/components'
import { Link, useLocalSearchParams, usePathname } from 'expo-router'
import React, { useCallback } from 'react'
import { View } from 'react-native'

const items = [{ name: 'Aktualności', href: '/' }, { name: 'Tabela wyników', href: '/leaderboard' }, { name: 'Dyscypliny', href: '/disciplines' }, { name: 'Zawodnicy', href: '/athletes' }]

const EventHeader = () => {
  const { eventId } = useLocalSearchParams()
  const pathname = usePathname()

  const isActive = useCallback((path: string) => pathname && pathname === path, [pathname])

  return <View className='flex-row gap-8 px-4 md:px-8 xl:px-24'>
    {items.map(({ name, href }) => {
      const linkHref = `/events/${eventId}${href}`
      const active = isActive(linkHref)

      return <Link key={href} href={linkHref} className={`py-2 leading-5 ${active ? 'border-b-2' : ''}`}>
        <Typography type={active ? 'dark' : 'washed'}>{name}</Typography>
      </Link>
    })}
  </View>
}

export default EventHeader