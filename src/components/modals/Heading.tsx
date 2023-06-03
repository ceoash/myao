import React from 'react'

interface HeadingProps {
    title: string;
    description: string;
}

const Heading = ({
    title,
    description
}: HeadingProps) => {

  return (
    <div className='border-b border-neutral-200 pb-4 mb-4'>
        <h4>{title}</h4>
        <p className='text-sm'>{description}</p>
    </div>
  )
}

export default Heading