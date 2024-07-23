// @refresh reload
import { useColorMode } from "@kobalte/core";
import { A } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import L, { LatLng, LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2 } from "lucide-solid";
import { Accessor, Match, Show, Switch, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { QueryBoundary } from "./QueryBoundary";

type Geo =
  | {
      type: "idle";
    }
  | {
      type: "loading";
    }
  | {
      type: "success";
      coordinates: LatLngTuple;
      accuracy?: number;
      zoom: number;
    }
  | {
      type: "error";
      message: string;
    };

const [mapStore, setMapStore] = createStore<Geo>({
  type: "idle",
});

const [map, setMap] = createSignal<L.Map | null>(null);

const [darkTile] = createSignal<L.TileLayer>(
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    maxZoom: 20,
  })
);

const [lightTile] = createSignal<L.TileLayer>(
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    maxZoom: 20,
  })
);

function loadMap(
  div: HTMLDivElement,
  {
    coordinates,
    zoom,
    accuracy,
  }: {
    coordinates: LatLngTuple;
    zoom: number;
    accuracy?: number;
  },
  themeMode: "dark" | "light"
) {
  if (!div) return;
  let m = map();
  if (!m) {
    m = L.map(div, {
      touchZoom: true,
      zoomControl: false,
      attributionControl: false,
    }).setView(coordinates, zoom);
    m.on("zoom", (e) => {
      if (!m) return;
      const zoom = m.getZoom();
      setMapStore({
        ...mapStore,
        type: "success",
        zoom,
      });
    });
    m.on("move", (e) => {
      if (!m) return;
      const center = m.getCenter();
      setMapStore({
        ...mapStore,
        type: "success",
        coordinates: [center.lat, center.lng],
      });
    });

    m.addEventListener("mousedown", (e) => {
      // right click is changing rotation
      if (e.originalEvent.button === 2) {
        // @ts-ignore - rotate is a custom method that exists
        const startingBearing = m.getBearing();
        const startingX = e.originalEvent.clientX;
        // detect mouse movement and rotate the map accordingly until mouse is released
        const mouseMove = (e: MouseEvent) => {
          const diff = e.clientX - startingX;
          const diffBearing = diff / 10;
          const finalBearing = startingBearing + diffBearing;
          // @ts-ignore - rotate is a custom method that exists
          m.setBearing(finalBearing);
        };
        const mouseUp = () => {
          document.removeEventListener("mousemove", mouseMove);
          document.removeEventListener("mouseup", mouseUp);
        };
        document.addEventListener("mousemove", mouseMove);
        document.addEventListener("mouseup", mouseUp);
      }
    });
    document.getElementById("map")?.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }

  setMap(m);
  // L.marker([51.5, -0.09]).addTo(map).bindPopup("A pretty CSS3 popup.<br> Easily customizable.").openPopup();
}

export default function ClientMap(props: { query: Accessor<string> }) {
  let mapDiv: any;

  const lookup = createQuery(() => ({
    queryKey: ["lookup", props.query()],
    queryFn: async (params) => {
      const q = params.queryKey[1];
      if (q.length <= 2) {
        return null;
      }
      const result = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURI(q)}&format=json&addressdetails=1`
      ).then((res) => res.json());
      const m = map();
      if (m) {
        const coords = new LatLng(result[0].lat, result[0].lon);
        setMapStore({
          ...mapStore,
          type: "success",
          coordinates: [result[0].lat, result[0].lon],
          zoom: 13,
        });
        m.setView(coords, 13);
        const marker = L.marker(coords, {
          icon: L.divIcon({
            html: `<div class="relative flex flex-col items-center justify-center text-blue-500 -translate-x-[50%] -translate-y-[50%] w-[42px] h-[42px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class=""><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>`,
            className: "bg-transparent",
          }),
        });
        const featureGroup = L.featureGroup([marker]).addTo(m);
        m.fitBounds(featureGroup.getBounds());
      }
      return result[0];
    },
    get enable() {
      const q = props.query();
      return q.length > 2;
    },
    refetchOnWindowFocus: false,
  }));

  const { colorMode: theme } = useColorMode();
  const startMap = () => {
    const t = theme();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapStore({
          ...mapStore,
          type: "success",
          coordinates: [latitude, longitude],
          zoom: 13,
          accuracy: position.coords.accuracy ?? 25,
        });
        loadMap(
          mapDiv,
          {
            coordinates: [latitude, longitude],
            zoom: 13,
            accuracy: position.coords.accuracy ?? 25,
          },
          t
        );
      },
      (error) => {
        setMapStore({
          type: "error",
          message: error.message,
        });
        console.log(error);
      }
    );
  };

  createEffect(() => {
    const m = map();
    if (!m) return;
    const themeMode = theme();
    if (themeMode === "dark") {
      darkTile().addTo(m);
      lightTile().removeFrom(m);
    } else {
      lightTile().addTo(m);
      darkTile().removeFrom(m);
    }
  });

  onMount(() => {
    startMap();
    const m = map();
    if (m) {
      m.setZoom(13);
    }
    onCleanup(() => {
      const m = map();
      if (!m) return;
      m.remove();
      setMap(null);
    });
  });

  createEffect(() => {
    // store the map in local storage
    localStorage.setItem("main-map", JSON.stringify(mapStore));
  });
  return (
    <div class="w-full flex flex-col gap-4">
      <div class="border-muted border rounded-md w-full flex flex-col items-center justify-center bg-muted h-[280px] overflow-clip">
        <Switch>
          <Match when={mapStore.type === "loading"}>
            <div class="items-center justify-center flex flex-col w-full h-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span class="text-neutral-500 text-sm">Loading map...</span>
            </div>
          </Match>
          <Match when={mapStore.type === "idle"}>
            <div class="items-center justify-center flex flex-col w-full h-full">
              <button
                class="px-2 py-1 flex flex-row gap-2 items-center justify-center bg-white dark:bg-black rounded-md shadow-md border border-neutral-200 dark:border-neutral-800 "
                onClick={() => {
                  startMap();
                }}
              >
                Load map
              </button>
            </div>
          </Match>
          <Match when={mapStore.type === "error" && mapStore}>
            {(x) => <div class="items-center justify-center flex flex-col w-full h-full">{x().message}</div>}
          </Match>
        </Switch>
        <div
          ref={mapDiv}
          id="main-map"
          style={{
            position: "relative",
            "z-index": 10,
            ...(mapStore.type === "success" && {
              width: "100%",
              height: "100%",
            }),
            border: "none",
          }}
        />
      </div>
      <QueryBoundary
        query={lookup}
        loadingFallback={<Loader2 class="size-4 animate-spin" />}
        errorFallback={<div class="text-xs text-red-500">{JSON.stringify(lookup.error)}</div>}
        notFoundFallback={<div class="text-sm">Please search for an place.</div>}
      >
        {(d) => (
          <Show when={d && d.address}>
            {(data) => (
              <div class="font-medium text-sm">
                {data().road} {data().house_number}, {data().postcode} {data().town} - {data().country}
              </div>
            )}
          </Show>
        )}
      </QueryBoundary>
      <div class="w-max text-muted-foreground text-xs">
        This map is provided by{" "}
        <A
          href="https://carto.com/attributions"
          class="hover:text-foreground font-bold underline underline-offset-2"
          rel="external"
          target="_new"
        >
          CARTO
        </A>{" "}
        via{" "}
        <A
          href="https://www.openstreetmap.org/copyright"
          class="hover:text-foreground font-bold underline underline-offset-2"
          rel="external"
          target="_new"
        >
          OpenStreetMap
        </A>{" "}
        and{" "}
        <A
          href="https://leafletjs.com/"
          class="hover:text-foreground font-bold underline underline-offset-2"
          rel="external"
          target="_new"
        >
          Leaflet
        </A>
      </div>
    </div>
  );
}
