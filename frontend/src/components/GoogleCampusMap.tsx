import { Icon } from './Icons'
import { Button, Card } from './UI'

export type CampusPlace = {
    id: string
    title: string
    subtitle?: string
    query: string
}

type GoogleCampusMapProps = {
    selectedPlace: CampusPlace
    places: CampusPlace[]
    onSelectPlace: (place: CampusPlace) => void
}

function buildGoogleMapsEmbedUrl(query: string) {
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
}

function buildGoogleMapsOpenUrl(query: string) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function buildGoogleMapsDirectionsUrl(query: string) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
}

export function GoogleCampusMap({
    selectedPlace,
    places,
    onSelectPlace,
}: GoogleCampusMapProps) {
    return (
        <Card
            pad={0}
            style={{
                width: '100%',
                minWidth: 0,
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 320px',
                    minHeight: 560,
                }}
                className="campus-google-map-layout"
            >
                <div
                    style={{
                        position: 'relative',
                        minWidth: 0,
                        minHeight: 420,
                        background: 'var(--surface-2)',
                    }}
                >
                    <iframe
                        title={`Mapa de ${selectedPlace.title}`}
                        src={buildGoogleMapsEmbedUrl(selectedPlace.query)}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                        style={{
                            width: '100%',
                            height: '100%',
                            minHeight: 420,
                            border: 0,
                            display: 'block',
                        }}
                    />

                    <div
                        style={{
                            position: 'absolute',
                            top: 14,
                            left: 14,
                            maxWidth: 'calc(100% - 28px)',
                            padding: '9px 12px',
                            borderRadius: 'var(--r-full)',
                            background: 'color-mix(in oklch, var(--surface) 86%, transparent)',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-sm)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            color: 'var(--text-2)',
                            fontSize: 12,
                            fontWeight: 600,
                        }}
                    >
                        <Icon name="mapPin" size={14} />
                        Google Maps
                    </div>
                </div>

                <aside
                    style={{
                        minWidth: 0,
                        borderLeft: '1px solid var(--border)',
                        background: 'var(--surface)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                    className="campus-google-map-panel"
                >
                    <div
                        style={{
                            padding: 18,
                            borderBottom: '1px solid var(--border)',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                color: 'var(--text-3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.07em',
                                fontWeight: 700,
                            }}
                        >
                            Lugar seleccionado
                        </div>

                        <h3
                            style={{
                                margin: '6px 0 0',
                                fontFamily: 'var(--font-display)',
                                fontSize: 20,
                                lineHeight: 1.15,
                                color: 'var(--text)',
                            }}
                        >
                            {selectedPlace.title}
                        </h3>

                        {selectedPlace.subtitle && (
                            <p
                                style={{
                                    margin: '5px 0 0',
                                    fontSize: 13,
                                    color: 'var(--text-2)',
                                    lineHeight: 1.4,
                                }}
                            >
                                {selectedPlace.subtitle}
                            </p>
                        )}

                        <div
                            style={{
                                display: 'flex',
                                gap: 8,
                                marginTop: 14,
                                flexWrap: 'wrap',
                            }}
                        >
                            <a
                                href={buildGoogleMapsDirectionsUrl(selectedPlace.query)}
                                target="_blank"
                                rel="noreferrer"
                                style={{ textDecoration: 'none' }}
                            >
                                <Button size="sm" variant="primary">
                                    Ir
                                </Button>
                            </a>

                            <a
                                href={buildGoogleMapsOpenUrl(selectedPlace.query)}
                                target="_blank"
                                rel="noreferrer"
                                style={{ textDecoration: 'none' }}
                            >
                                <button
                                    style={{
                                        height: 34,
                                        padding: '0 12px',
                                        borderRadius: 'var(--r-sm)',
                                        border: '1px solid var(--border)',
                                        background: 'var(--surface-2)',
                                        color: 'var(--text-2)',
                                        fontFamily: 'var(--font-ui)',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Abrir mapa
                                </button>
                            </a>
                        </div>
                    </div>

                    <div
                        style={{
                            padding: 14,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            overflowY: 'auto',
                        }}
                    >
                        {places.map((place) => {
                            const active = place.id === selectedPlace.id

                            return (
                                <button
                                    key={place.id}
                                    onClick={() => onSelectPlace(place)}
                                    style={{
                                        width: '100%',
                                        minWidth: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 11,
                                        padding: '12px',
                                        borderRadius: 'var(--r-md)',
                                        border: active
                                            ? '1px solid var(--primary)'
                                            : '1px solid var(--border)',
                                        background: active
                                            ? 'var(--primary-soft)'
                                            : 'var(--surface-2)',
                                        color: active ? 'var(--primary-text)' : 'var(--text)',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontFamily: 'var(--font-ui)',
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: 'var(--r-sm)',
                                            background: active ? 'var(--primary)' : 'var(--surface)',
                                            color: active ? 'var(--on-primary)' : 'var(--text-2)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            border: active ? 'none' : '1px solid var(--border)',
                                        }}
                                    >
                                        <Icon name="mapPin" size={16} />
                                    </span>

                                    <span style={{ minWidth: 0 }}>
                                        <strong
                                            style={{
                                                display: 'block',
                                                fontSize: 13.5,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {place.title}
                                        </strong>

                                        {place.subtitle && (
                                            <small
                                                style={{
                                                    display: 'block',
                                                    marginTop: 3,
                                                    fontSize: 11.5,
                                                    color: active ? 'var(--primary-text)' : 'var(--text-3)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {place.subtitle}
                                            </small>
                                        )}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </aside>
            </div>
        </Card>
    )
}