import React from 'react'

interface HeadingProps {
    title: string;
    description: string;
    nounderline?: boolean;
}

const Heading = ({
    title,
    description,
    nounderline,
}: HeadingProps) => {

  return (
    <div className={`${nounderline && `border-b border-neutral-200`} pb-4 mb-4`}>
        <h4>{title}</h4>
        <p className='text-sm'>{description}</p>
    </div>
  )
}

export default Heading