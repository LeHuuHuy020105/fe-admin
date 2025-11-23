
import React, { Activity } from 'react'
import StatsGrid from './StatsGrid'
import ChartSection from './ChartSection'
import { Table } from 'lucide-react'
import TableSection from './TableSection'
import ActivityFeed from './ActivityFeed'

export default function Dashboard() {
  return (
    <div className='space-y-6'>
        <StatsGrid />

        <ChartSection/>

        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
            <div className='xl:col-span-2'>
                <TableSection/>
            </div>
            <div>
                <ActivityFeed/>
            </div>
        </div>
    </div>
  )
}
