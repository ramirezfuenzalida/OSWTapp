
import React, { useState, useMemo } from 'react';
import { Search, User, CheckCircle, ArrowRight, LogOut, LogIn, RotateCcw, Tag, UserCheck, AlertCircle } from 'lucide-react';
import { InventoryItem } from '../types.ts';
import { globalNormalize } from '../App.tsx';

interface StudentCheckOutProps {
  inventory: InventoryItem[];
  onConfirm: (id: number, student: string, curso: string, fecha: string) => void;
  onReturn: (id: number, fecha: string) => void;
  onCancel?: () => void;
  isExternalView?: boolean;
  availableStudents?: { name: string; course: string; }[]; // New prop for student list
}

const StudentCheckOut: React.FC<StudentCheckOutProps> = ({ inventory, onConfirm, onReturn, onCancel, isExternalView, availableStudents }) => {
  const [mode, setMode] = useState<'out' | 'in'>('out');
  const [instrumentSearch, setInstrumentSearch] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentCourse, setStudentCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedInstrument, setSelectedInstrument] = useState<InventoryItem | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const normalizeText = (val: any) => (val || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const isLoaned = (item: InventoryItem) => {
    const v = globalNormalize(item.Prestado);
    return v === 'si' || v === 'yes' || v === 'prestado' || v === 'en casa' || v === 'hogar' || v === 'salida';
  };

  /**
   * Genera un sonido de Acorde Premium (Estilo iOS Success Chord)
   * Utiliza síntesis aditiva para crear una textura rica y profesional.
   */
  const playSuccessSound = () => {
    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;

      const playTone = (freq: number, type: OscillatorType, volume: number, duration: number, delay: number = 0) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + delay);

        // Envolvente de volumen (Ataque percusivo iOS)
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(volume, now + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + duration);
      };

      // ACORDE DE ÉXITO (Inspirado en iOS Pay/Success)
      // Capa de cuerpo (Armonía)
      playTone(523.25, 'sine', 0.15, 0.8, 0);     // C5 (Do)
      playTone(659.25, 'sine', 0.12, 0.8, 0.02);  // E5 (Mi)
      playTone(783.99, 'sine', 0.10, 0.8, 0.04);  // G5 (Sol)

      // Capa de Brillo (Cristalino)
      playTone(1046.50, 'triangle', 0.08, 0.4, 0.06); // C6 (Octava arriba)
      playTone(1318.51, 'sine', 0.05, 0.4, 0.08);     // E6 (Brillo final)

      // Mini Click inicial para sensación táctil
      const click = audioCtx.createOscillator();
      const clickGain = audioCtx.createGain();
      click.type = 'square';
      click.frequency.setValueAtTime(2000, now);
      clickGain.gain.setValueAtTime(0.05, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      click.connect(clickGain);
      clickGain.connect(audioCtx.destination);
      click.start(now);
      click.stop(now + 0.02);

    } catch (e) {
      console.warn("Audio feedback error:", e);
    }
  };

  // List of students who currently have instruments checked out (for Return mode)
  const loanedStudents = useMemo(() => {
    const studentNamesInInventory = new Set(
      inventory
        .filter(item => isLoaned(item))
        .map(item => globalNormalize(item.Estudiante))
        .filter(name => name !== '')
    );

    return availableStudents?.filter(s => studentNamesInInventory.has(globalNormalize(s.name))) || [];
  }, [inventory, availableStudents]);

  const searchResults = useMemo(() => {
    const term = normalizeText(instrumentSearch);
    if (!term) return [];

    return inventory.filter(item => {
      const loaned = isLoaned(item);

      // En modo SALIDA: solo items en sala
      // En modo RETORNO: solo items en hogar (prestados)
      if (mode === 'out' && loaned) return false;
      if (mode === 'in' && !loaned) return false;

      // Coincidencia por texto
      const matchesText =
        normalizeText(item.Instrumento).includes(term) ||
        normalizeText(item.Estudiante).includes(term) ||
        normalizeText(item.Marca).includes(term) ||
        normalizeText(item.Serie).includes(term) ||
        normalizeText(item.Modelo).includes(term);

      return matchesText;
    }).slice(0, 15); // Aumentar límite para ver múltiples instrumentos
  }, [instrumentSearch, inventory, mode]);

  const handleStudentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setStudentName(name);
    setValidationError(null); // Reset error on change

    // If a student is selected from the datalist, try to autofill the course
    const listToSearch = mode === 'out' ? availableStudents : loanedStudents;
    const found = listToSearch?.find(s => s.name.toUpperCase() === name.toUpperCase());
    if (found && !studentCourse) {
      setStudentCourse(found.course);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInstrument) {
      const listToSearch = mode === 'out' ? availableStudents : loanedStudents;
      const isRegistered = listToSearch?.some(s => normalizeText(s.name) === normalizeText(studentName));

      if (mode === 'out' && !isRegistered) {
        setValidationError(`El estudiante "${studentName}" no está registrado. Por favor, regístrelo primero en el Directorio.`);
        return;
      }

      if (mode === 'in') {
        const recordName = normalizeText(selectedInstrument.Estudiante);
        const inputName = normalizeText(studentName);

        if (!recordName) {
          setValidationError("Este instrumento figura como prestado pero no tiene un alumno asignado en el sistema.");
          return;
        }

        if (inputName !== recordName) {
          setValidationError(`Error: Registro de ${selectedInstrument.Estudiante}. Por favor, verifique el nombre ingresado.`);
          return;
        }
      }

      if (mode === 'out') onConfirm(selectedInstrument.id, studentName.toUpperCase(), studentCourse.toUpperCase(), selectedDate);
      else onReturn(selectedInstrument.id, selectedDate);

      // Feedback auditivo Premium iOS Chord
      playSuccessSound();

      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-10 rounded-[3rem] text-center shadow-2xl">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500"><CheckCircle className="w-10 h-10 text-emerald-500" /></div>
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Registro Exitoso</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">La información ha sido actualizada</p>
        <button onClick={() => { setIsSubmitted(false); setInstrumentSearch(''); setSelectedInstrument(null); setStudentName(''); setStudentCourse(''); }} className="w-full bg-indigo-600 py-5 rounded-2xl font-black text-white flex items-center justify-center gap-3 uppercase tracking-widest text-xs hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"><RotateCcw className="w-4 h-4" /> Nuevo registro</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-visible backdrop-blur-md">
        <div className="flex p-2 bg-slate-950/50 rounded-t-[2.5rem] border-b border-slate-800/50">
          <button
            type="button"
            onClick={() => { setMode('out'); setSelectedInstrument(null); setInstrumentSearch(''); setStudentName(''); setStudentCourse(''); }}
            className={`flex-1 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all ${mode === 'out' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <LogOut className="w-4 h-4 inline mr-2" /> Salida
          </button>
          <button
            type="button"
            onClick={() => { setMode('in'); setSelectedInstrument(null); setInstrumentSearch(''); setStudentName(''); setStudentCourse(''); }}
            className={`flex-1 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all ${mode === 'in' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <LogIn className="w-4 h-4 inline mr-2" /> Retorno
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-12 space-y-8">
          <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${mode === 'out' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400'}`}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
              {mode === 'out'
                ? 'Solo se muestran instrumentos DISPONIBLES en la sala.'
                : 'Solo se muestran instrumentos con SALIDA ACTIVA para procesar el retorno.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Fecha</label>
              <input type="date" className="w-full px-5 py-4 bg-[#020617] border-2 border-slate-800 rounded-2xl text-white font-bold focus:border-indigo-500 outline-none" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-center">Buscar Instrumento / Alumno</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={mode === 'out' ? "Buscar instrumento disponible..." : "Buscar por instrumento o nombre del alumno..."}
                  className="w-full px-6 py-4.5 bg-[#020617] border-2 border-slate-800 rounded-2xl text-white font-bold focus:border-indigo-500 outline-none text-center placeholder:text-center"
                  value={instrumentSearch}
                  onChange={(e) => { setInstrumentSearch(e.target.value); setSelectedInstrument(null); }}
                />
                {searchResults.length > 0 && !selectedInstrument && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800/50">
                    {searchResults.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedInstrument(item);
                          setInstrumentSearch(item.Instrumento);
                          setStudentName(item.Estudiante || '');
                          setStudentCourse(item.Curso || '');
                        }}
                        className="w-full px-6 py-4 text-left hover:bg-indigo-500/10 flex justify-between items-center group transition-colors"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <span className="text-white font-black uppercase italic group-hover:text-indigo-400">{item.Instrumento}</span>
                            <span className="text-[9px] font-black px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded uppercase">
                              {item.Serie || 'S/N'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5" /> {item.Marca || 'GENÉRICO'} {item.Modelo ? `(${item.Modelo})` : ''}
                            </span>
                            {item.Estudiante && (
                              <span className="text-[9px] font-black text-indigo-400 uppercase flex items-center gap-1 bg-indigo-500/5 px-2 py-0.5 rounded">
                                <UserCheck className="w-2.5 h-2.5" /> {item.Estudiante}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-[8px] font-black px-2 py-1 rounded-md border ${isLoaned(item) ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                            {isLoaned(item) ? 'EN HOGAR' : 'EN SALA'}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-700" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {instrumentSearch && searchResults.length === 0 && !selectedInstrument && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-slate-800 p-6 rounded-2xl text-center z-50">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      {mode === 'out'
                        ? 'No se encontraron instrumentos disponibles'
                        : 'No se encontraron instrumentos con salida activa'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedInstrument && (
            <div className="p-8 bg-slate-950/40 border border-slate-800 rounded-[2rem] space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex flex-col sm:flex-row gap-6 border-b border-slate-800 pb-6">
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Instrumento Seleccionado</p>
                  <p className="text-xl font-black text-white italic uppercase tracking-tighter">{selectedInstrument.Instrumento}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Marca: <span className="text-slate-200">{selectedInstrument.Marca || 'S/M'}</span></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Serie: <span className="text-slate-200">{selectedInstrument.Serie || 'S/N'}</span></span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Estado de Inventario</p>
                  <span className={`inline-block text-[10px] font-black uppercase px-3 py-1 rounded-full border ${isLoaned(selectedInstrument) ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                    {isLoaned(selectedInstrument) ? 'Fuera de Sala' : 'En Sala (Disponible)'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre Alumno</label>
                  <input
                    type="text"
                    required
                    disabled={mode === 'in'}
                    placeholder="Ingrese nombre completo"
                    className={`w-full px-6 py-5 bg-[#020617] border-2 rounded-2xl text-white font-black uppercase transition-all ${validationError ? 'border-red-500 animate-shake' : 'border-slate-800 focus:border-indigo-500'} ${mode === 'in' ? 'opacity-40 cursor-not-allowed bg-slate-950 shadow-inner' : ''}`}
                    value={studentName}
                    onChange={handleStudentNameChange} // Use the new handler
                    list="student-names" // Link to datalist
                  />
                  {validationError && (
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="w-3 h-3" /> {validationError}
                    </p>
                  )}
                  {availableStudents && mode === 'out' && (
                    <datalist id="student-names">
                      {availableStudents.map((student, index) => (
                        <option key={index} value={student.name} />
                      ))}
                    </datalist>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Curso / Grado</label>
                  <input
                    type="text"
                    required
                    disabled={mode === 'in'}
                    placeholder="Ej. 1RO MEDIO"
                    className={`w-full px-6 py-5 bg-[#020617] border-2 border-slate-800 rounded-2xl text-white font-black uppercase focus:border-indigo-500 transition-colors ${mode === 'in' ? 'opacity-40 cursor-not-allowed bg-slate-950 shadow-inner' : ''}`}
                    value={studentCourse}
                    onChange={(e) => setStudentCourse(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedInstrument || !studentName || !studentCourse} // Disable if student details are missing
            className={`w-full py-7 rounded-[2rem] font-black text-xl uppercase italic tracking-tighter shadow-2xl disabled:opacity-20 text-white transition-all active:scale-95 ${mode === 'out' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'}`}
          >
            {mode === 'out' ? 'Confirmar Salida' : 'Confirmar Retorno'}
          </button>

          {onCancel && !isExternalView && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full text-slate-600 hover:text-white font-black uppercase text-[10px] tracking-[0.3em] py-2 transition-colors text-center"
            >
              Cancelar y volver
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default StudentCheckOut;
