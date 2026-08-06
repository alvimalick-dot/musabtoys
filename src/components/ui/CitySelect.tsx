"use client";

import { useEffect, useRef, useState } from "react";

const PAKISTAN_CITIES = [
  "Abbottabad",
  "Ahmedpur East",
  "Arifwala",
  "Attock",
  "Badin",
  "Bahawalnagar",
  "Bahawalpur",
  "Bhakkar",
  "Bhalwal",
  "Bannu",
  "Batkhela",
  "Burewala",
  "Chakwal",
  "Charsadda",
  "Chichawatni",
  "Chiniot",
  "Chishtian",
  "Dadu",
  "Daska",
  "Dera Ghazi Khan",
  "Dera Ismail Khan",
  "Dijkot",
  "Faisalabad",
  "Ghotki",
  "Gujar Khan",
  "Gujranwala",
  "Gujrat",
  "Hafizabad",
  "Haripur",
  "Haveli",
  "Havelian",
  "Hub",
  "Hyderabad",
  "Islamabad",
  "Jacobabad",
  "Jaranwala",
  "Jatoi",
  "Jhang",
  "Jhelum",
  "Kabal",
  "Kamalia",
  "Kamoke",
  "Kandhkot",
  "Karachi",
  "Kasur",
  "Khanewal",
  "Khanpur",
  "Kharian",
  "Khewra",
  "Khushab",
  "Khuzdar",
  "Kohat",
  "Kot Addu",
  "Kotri",
  "Kundian",
  "Lahore",
  "Larkana",
  "Layyah",
  "Lodhran",
  "Mandi Bahauddin",
  "Mansehra",
  "Mardan",
  "Matiari",
  "Mehar",
  "Mian Channu",
  "Mianwali",
  "Mirpur",
  "Mirpur Khas",
  "Multan",
  "Muridke",
  "Muzaffarabad",
  "Muzaffargarh",
  "Nankana Sahib",
  "Narowal",
  "Nasirabad",
  "Nawabshah",
  "Nowshera",
  "Okara",
  "Pakpattan",
  "Peshawar",
  "Pir Mahal",
  "Pishin",
  "Qila Didar Singh",
  "Quetta",
  "Rahim Yar Khan",
  "Rajanpur",
  "Rawalakot",
  "Rawalpindi",
  "Renala Khurd",
  "Sadiqabad",
  "Sahiwal",
  "Sambrial",
  "Sanghar",
  "Sargodha",
  "Sehwan",
  "Sheikhupura",
  "Shikarpur",
  "Sialkot",
  "Sibi",
  "Sikandarabad",
  "Sohawa",
  "Sukkur",
  "Swabi",
  "Swat",
  "Tando Adam",
  "Tando Allahyar",
  "Tando Muhammad Khan",
  "Tank",
  "Tarlai",
  "Tharparkar",
  "Thatta",
  "Toba Tek Singh",
  "Turbat",
  "Umerkot",
  "Vehari",
  "Wah Cantonment",
  "Wazirabad",
  "Yazman",
  "Zafarwal",
  "Zhob",
];

interface CitySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function CitySelect({ value, onChange, error }: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync query when value changes externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query.trim()
    ? PAKISTAN_CITIES.filter((c) =>
        c.toLowerCase().includes(query.toLowerCase())
      )
    : PAKISTAN_CITIES;

  function selectCity(city: string) {
    setQuery(city);
    onChange(city);
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        className={`input-field ${error ? "border-coral-deep" : ""}`}
        placeholder="Search your city…"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          if (!open) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "Enter" && filtered.length === 1) {
            selectCity(filtered[0]);
          }
        }}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls="city-list"
        aria-autocomplete="list"
      />
      {open && (
        <ul
          id="city-list"
      className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl bg-white shadow-lg ring-1 ring-black/5 dark:bg-slate-800 dark:ring-slate-700"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted">
              {query ? `Use "${query}" as city` : "Type to search cities"}
            </li>
          ) : (
            filtered.map((city) => (
              <li
                key={city}
                role="option"
                aria-selected={city === value}
             className={`cursor-pointer px-4 py-2.5 text-sm transition hover:bg-[#fef6ed] dark:hover:bg-slate-700 ${
                  city === value ? "bg-[#fef6ed] font-bold text-coral dark:bg-slate-700" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectCity(city);
                }}
              >
                {city}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

