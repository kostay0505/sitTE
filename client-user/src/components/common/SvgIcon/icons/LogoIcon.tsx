import Image from 'next/image';

const IconComponent: React.FC<{ className?: string }> = ({ className }) => (
  <Image
    src='/images/logo.png'
    alt='logo'
    width={60}
    height={28}
    className={className}
    unoptimized
  />
);

export default IconComponent;
