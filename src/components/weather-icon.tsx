import Image from 'next/image';

interface WeatherIconProps {
  iconCode: string;
  altText: string;
  size?: number;
}

export function WeatherIcon({ iconCode, altText, size = 64 }: WeatherIconProps) {
  if (!iconCode) return null;

  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src={iconUrl}
        alt={altText}
        width={size}
        height={size}
        priority // Load weather icons quickly
        data-ai-hint="weather condition"
      />
    </div>
  );
}