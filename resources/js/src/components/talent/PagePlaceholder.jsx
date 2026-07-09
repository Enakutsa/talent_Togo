export default function PagePlaceholder({ label, icon: Icon }) {
    return (
      <div className="td-page td-placeholder">
        <div className="td-placeholder-inner">
          {Icon && <Icon size={40} />}
          <h2>{label}</h2>
          <p>Cette section est en cours de développement.</p>
        </div>
      </div>
    );
  }