import React from 'react'
import RevenueChart from './RevenueChart'
import SalesChart from './SalesChart'

interface ChartSectionProps {
  revenue: any; // dữ liệu doanh thu từ API
  categories: any[]; // dữ liệu categories từ API
}
export default function ChartSection({ revenue, categories }: ChartSectionProps) {
  return (
    <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        <div className='xl:col-span-2'>
            <RevenueChart revenue={revenue}/>
        </div>

        <div className='space-y-6'>
            <SalesChart categories={categories}/>
        </div>
    </div>
  )
}
