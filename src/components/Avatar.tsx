import Image from 'next/image'
import React from 'react'

const Avatar = () => {
  return (
    <Image
        src="/images/placeholders/avatar.png"
        alt="Picture of the author"
        width={30}
        height={30}
        className="rounded-full"
    />
  )
}

export default Avatar