import { useState } from 'react';
import { addressApi } from '../api/index.js';
import { errorText } from '../utils/format.js';

const TYPES = [['home', 'Home'], ['work', 'Work'], ['other', 'Other']];
const BLANK = { street: '', city: '', state: '', zipCode: '', type: 'home' };

const validate = (f) => (f.street.trim() && f.city.trim() && f.state.trim() && f.zipCode.trim()
  ? '' : 'Please fill in address, city/town, state and pincode.');
const payload = (f) => ({ street: f.street.trim(), city: f.city.trim(), state: f.state.trim(), zipCode: f.zipCode.trim(), type: f.type });

export function AddressFields({ value, onChange, disabled = false, showType = false }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="addr-fields">
      <label className="fld"><span>Address</span>
        <textarea rows={3} maxLength={255} disabled={disabled} value={value.street} onChange={set('street')} />
      </label>
      <div className="row2">
        <label className="fld"><span>City/Town</span>
          <input maxLength={100} disabled={disabled} value={value.city} onChange={set('city')} />
        </label>
        <label className="fld"><span>State</span>
          <input maxLength={100} disabled={disabled} value={value.state} onChange={set('state')} />
        </label>
      </div>
      <div className="row2">
        <label className="fld"><span>Pincode</span>
          <input inputMode="numeric" maxLength={20} disabled={disabled} value={value.zipCode} onChange={set('zipCode')} />
        </label>
      </div>
      {showType && (
        <div className="fld"><span>Type</span>
          <div className="radios" role="radiogroup" aria-label="Address type">
            {TYPES.map(([v, l]) => (
              <label key={v} className="radio">
                <input type="radio" name="addr-type" checked={value.type === v} onChange={() => onChange({ ...value, type: v })} />
                <i /> {l}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const heading = (a, i) => `${i + 1}.${(a.type || 'home').toUpperCase()}`;

// One saved address: read-only until "Edit" is pressed. `selectable` adds the checkout radio.
export function AddressCard({ address, index, selectable, selected, onSelect, onSaved, onRemoved }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(address);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    const v = validate(form);
    if (v) return setErr(v);
    setBusy(true); setErr('');
    try {
      const { data } = await addressApi.update(address.id, payload(form));
      onSaved(data);
      setEditing(false);
    } catch (e) { setErr(errorText(e)); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!window.confirm('Delete this address?')) return;
    setBusy(true); setErr('');
    try { await addressApi.remove(address.id); onRemoved(address.id); } catch (e) { setErr(errorText(e)); setBusy(false); }
  };

  return (
    <section className="addr-card">
      <div className="addr-head">
        {selectable && !editing && (
          <button type="button" className={`dot${selected ? ' on' : ''}`} role="radio" aria-checked={selected} aria-label={`Use address ${heading(address, index)}`} onClick={() => onSelect(address.id)} />
        )}
        <b>{heading(address, index)}</b>
        {!editing && <button type="button" className="link-red" onClick={() => { setForm(address); setEditing(true); }}>Edit</button>}
      </div>
      <AddressFields value={editing ? form : address} onChange={setForm} disabled={!editing} showType={editing} />
      {editing && (
        <div className="addr-actions">
          <button type="button" className="btn-blue sm" disabled={busy} onClick={save}>Save</button>
          <button type="button" className="btn-ghost" disabled={busy} onClick={() => { setEditing(false); setErr(''); }}>Cancel</button>
          <button type="button" className="link-red push" disabled={busy} onClick={remove}>Delete</button>
        </div>
      )}
      {err && <p className="form-err" role="alert">{err}</p>}
    </section>
  );
}

export function AddressCreate({ onCreated, onCancel }) {
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const save = async () => {
    const v = validate(form);
    if (v) return setErr(v);
    setBusy(true); setErr('');
    try {
      const { data } = await addressApi.create(payload(form));
      onCreated(data);
    } catch (e) { setErr(errorText(e)); } finally { setBusy(false); }
  };
  return (
    <section className="addr-card">
      <AddressFields value={form} onChange={setForm} showType />
      <div className="addr-actions">
        <button type="button" className="btn-blue sm" disabled={busy} onClick={save}>Save address</button>
        {onCancel && <button type="button" className="btn-ghost" disabled={busy} onClick={onCancel}>Cancel</button>}
      </div>
      {err && <p className="form-err" role="alert">{err}</p>}
    </section>
  );
}
