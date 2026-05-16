import { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  value: number;
  onChange: (stars: number) => void;
  readonly?: boolean;
}

export function StarRating({ value, onChange, readonly = false }: Props) {
  const [hovered, setHovered] = useState(0);

  const effective = hovered > 0 ? hovered : value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`transition-transform ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              star <= effective
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
