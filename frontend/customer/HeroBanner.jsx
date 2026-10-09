import wallpaper from "../assets/H-S-Wallpaper.png";

export default function HeroBanner() {
  return (
    <div className="w-full pt-24 pb-8 bg-white">
      <img 
        src={wallpaper} 
        alt="H&S Wallpaper" 
        className="w-full h-auto object-contain block"
      />
    </div>
  );
}
