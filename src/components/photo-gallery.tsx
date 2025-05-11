"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CameraOff, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const UNSPLASH_ACCESS_KEY = "tE7YM7Yt0Uhg-lCoZrwdZyogmilr0ipNhZN83RiBXYA";

export function PhotoGallery({ locationName }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<UnsplashPhoto | null>(null);

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
     return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 text-primary flex items-center">
        <span className="bg-primary/10 p-1 rounded mr-2">
          <ImageIcon className="h-5 w-5 text-primary" />
        </span>
        Photo Gallery
      </h3>
      
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-muted/50 border border-border/30">
              <Skeleton className="h-full w-full" data-ai-hint="photo placeholder" />
            </div>
          ))}
        </div>
      )}
      
      {error && !isLoading && (
        <Alert variant="destructive" className="bg-destructive/10 text-destructive border border-destructive/30">
          <CameraOff className="h-5 w-5" />
          <AlertTitle className="font-semibold">Could Not Load Photos</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!isLoading && !error && photos.length === 0 && (
        <Alert variant="default" className="bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200">
          <CameraOff className="h-5 w-5" />
          <AlertTitle className="font-semibold">No Photos Found</AlertTitle>
          <AlertDescription>No photos were found for {locationName} on Unsplash.</AlertDescription>
        </Alert>
      )}
      
      {!isLoading && !error && photos.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-xl overflow-hidden bg-muted/50 border border-border/30 group shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <Image
                  src={photo.urls.small}
                  alt={photo.alt_description || `Image of ${locationName}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 200px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  data-ai-hint={`photo ${locationName}`}
                  priority={photos.indexOf(photo) < 3}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <p className="text-white text-xs font-medium truncate">Photo by {photo.user.name}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-muted-foreground">Photos from Unsplash</p>
            <a 
              href={`https://unsplash.com/s/photos/${encodeURIComponent(locationName)}?utm_source=roamfree&utm_medium=referral`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:text-primary/80 flex items-center space-x-1 font-medium transition-colors"
            >
              <span>View more</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </>
      )}
      
      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-background rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video">
              <Image
                src={selectedPhoto.urls.regular}
                alt={selectedPhoto.alt_description || `Image of ${locationName}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 flex justify-between items-center">
              <p className="text-sm">Photo by <a href={selectedPhoto.user.links.html} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{selectedPhoto.user.name}</a></p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedPhoto(null)}>
                  Close
                </Button>
                <Button size="sm" asChild>
                  <a href={`https://unsplash.com/photos/${selectedPhoto.id}?utm_source=roamfree&utm_medium=referral`} target="_blank" rel="noopener noreferrer">
                    View on Unsplash
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}