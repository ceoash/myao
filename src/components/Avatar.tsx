import Image from 'next/image'

interface AvatarProps {
  user: any
}

const Avatar = ({user}: AvatarProps) => {
  return (
    <Image
        src={user?.profile?.image || "/images/placeholders/avatar.png"}
        alt="Picture of the author"
        width={30}
        height={30}
        className="rounded-full"
    />
  )
}

export default Avatar