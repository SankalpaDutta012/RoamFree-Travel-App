
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CameraOff, Image as ImageIcon } from 'lucide-react';

interface UnsplashPhoto {
  id: string;
  urls: {
    small: string;
    regular: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

interface PhotoGalleryProps {
  locationName: string | undefined;
}

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

export function PhotoGallery({ locationName }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!locationName) {
      setPhotos([]);
      setError(null);
      return;
    }

    if (!UNSPLASH_ACCESS_KEY) {
      setError("Unsplash API key is not configured. Please add NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to your environment variables.");
      console.warn("Unsplash API key is missing. Photos will not be loaded.");
      setPhotos([]);
      return;
    }

    const fetchPhotos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(locationName)}&per_page=6&client_id=${UNSPLASH_ACCESS_KEY}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors?.[0] || `Failed to fetch photos (status: ${response.status})`);
        }
        const data = await response.json();
        setPhotos(data.results);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error fetching photos from Unsplash:', errorMessage);
        setError(errorMessage);
        setPhotos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, [locationName]);

  if (!locationName) {
    return null; // Don't render anything if no location name
  }
  
  if (!UNSPLASH_ACCESS_KEY && !error) {
     // This state is handled by the useEffect which sets an error.
     // If error is already set, it will be displayed below.
    return null;
  }


  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
        <ImageIcon className="h-5 w-5 mr-2" />
        Photo Gallery
      </h3>
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="aspect-square w-full rounded-lg" data-ai-hint="photo placeholder" />
          ))}
        </div>
      )}
      {error && !isLoading && (
        <Alert variant="destructive">
          <CameraOff className="h-5 w-5" />
          <AlertTitle>Could Not Load Photos</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!isLoading && !error && photos.length === 0 && (
        <Alert variant="default">
          <CameraOff className="h-5 w-5" />
          <AlertTitle>No Photos Found</AlertTitle>
          <AlertDescription>No photos were found for {locationName} on Unsplash.</AlertDescription>
        </Alert>
      )}
      {!isLoading && !error && photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <a 
              key={photo.id} 
              href={`https://unsplash.com/photos/${photo.id}?utm_source=roamfree&utm_medium=referral`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              aria-label={`View photo by ${photo.user.name} on Unsplash: ${photo.alt_description || locationName}`}
            >
              <div className="aspect-square relative w-full">
                <Image
                  src={photo.urls.small}
                  alt={photo.alt_description || `Image of ${locationName}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 200px"
                  className="object-cover"
                  data-ai-hint={`photo ${locationName}`}
                  priority={photos.indexOf(photo) < 3} // Prioritize loading for the first few images
                />
              </div>
            </a>
          ))}
        </div>
      )}
       {!isLoading && !error && photos.length > 0 && (
         <p className="text-xs text-muted-foreground mt-2 text-right">
           Photos from <a href={`https://unsplash.com/s/photos/${encodeURIComponent(locationName)}?utm_source=roamfree&utm_medium=referral`} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Unsplash</a>
         </p>
       )}
    </div>
  );
}
