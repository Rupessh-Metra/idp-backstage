export const Hero = () => (
  <div
    style={{
      background: 'linear-gradient(120deg, #1C3A63 0%, #2F6DB8 100%)',
      borderRadius: 4,
      padding: '32px 40px',
      color: '#F5F7FA',
    }}
  >
    <div
      style={{
        fontSize: 28,
        fontWeight: 700,
        color: '#FFFFFF',
        marginBottom: 8,
      }}
    >
      Ksquare IDP
    </div>
    <div style={{ fontSize: 16, maxWidth: 640, lineHeight: 1.5 }}>
      Self-service to create, catalog, and manage your services. Scaffold a
      new project, find who owns what, and check CI/CD status - all from one
      place.
    </div>
  </div>
);
