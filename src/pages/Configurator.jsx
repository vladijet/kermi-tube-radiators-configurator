import React, { useState, useMemo, useEffect } from 'react';
import ModelSeries from '@/components/configurator/ModelSeries';
import ConnectionVariants from '@/components/configurator/ConnectionVariants';
import BaseParameters from '@/components/configurator/BaseParameters';
import ExtendedParameters from '@/components/configurator/ExtendedParameters';
import SidebarFinish from '@/components/configurator/SidebarFinish';
import AirVent from '@/components/configurator/AirVent';
import RadiatorSpecsTable from '@/components/configurator/RadiatorSpecsTable';
import OrderModal from '@/components/configurator/OrderModal';
import ResetConfirmDialog from '@/components/configurator/ResetConfirmDialog';
import RadiatorServerPreview from '@/components/configurator/RadiatorServerPreview';
import { calculateResults, calculateResultsBySize, calculateTotalPrice, buildArticle, formatEuro, calculateDeltaT } from '@/lib/radiatorCalc';
import { AVAILABLE_HEIGHTS, CAMBIOTHERM_HEIGHTS, SECTION_LENGTH, MAX_SECTIONS, getConnectionVariantsForType, findConnectionVariant, CONNECTION_SIZE_RESTRICTIONS } from '@/lib/radiatorData';
import { getMaxSections, getBracketCount } from '@/lib/modelLimits';
import { getRalColor } from '@/lib/ralColors';
import { SlidersHorizontal, Copy, Check } from 'lucide-react';

export default function Configurator() {
  // Model & connection
  const [radiatorType, setRadiatorType] = useState('RRN');
  const [connGroup, setConnGroup] = useState('');
  const [connCode, setConnCode] = useState('');
  const [ralCode, setRalCode] = useState('9016');

  // Power & dimensions
  const [requiredPower, setRequiredPower] = useState(500);
  const [flowTemp, setFlowTemp] = useState(75);
  const [returnTemp, setReturnTemp] = useState(65);
  const [airTemp, setAirTemp] = useState(20);
  const [minHeight, setMinHeight] = useState(400);
  const [maxHeight, setMaxHeight] = useState(600);
  const [minLength, setMinLength] = useState(800);
  const [maxLength, setMaxLength] = useState(1000);
  const [selectedTubes, setSelectedTubes] = useState(null);
  const [height, setHeight] = useState(550);
  const [selectedSections, setSelectedSections] = useState(null);

  // Selection & extras
  const [selected, setSelected] = useState(null);
  const [colorCode, setColorCode] = useState('AF');
  const [highPressure, setHighPressure] = useState(false);
  const [drainValve, setDrainValve] = useState(false);
  const [ventType, setVentType] = useState(null);
  const [ventPosition, setVentPosition] = useState('-');
  const [connSize, setConnSize] = useState('12');
  const [ventConnSize, setVentConnSize] = useState('12');
  const [includeBracketKLK, setIncludeBracketKLK] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    setRadiatorType('RRN');
    setConnGroup('side');
    setConnCode('N12');
    setRalCode('9016');
    setRequiredPower(500);
    setFlowTemp(75);
    setReturnTemp(65);
    setAirTemp(20);
    setMinHeight(400); setMaxHeight(600);
    setMinLength(800); setMaxLength(1000);
    setSelectedTubes(null);
    setHeight(600);
    setSelectedSections(null);
    setSelected(null);
    setColorCode('AF');
    setHighPressure(false);
    setDrainValve(false);
    setVentType(null);
    setVentPosition('-');
    setConnSize('12');
    setVentConnSize('12');
    setIncludeBracketKLK(true);
    setShowReset(false);
    setShowResults(false);
    setShowOrderModal(false);
    setQuantity(1);
  };

  useEffect(() => {
    if (!radiatorType) return;
    const variants = getConnectionVariantsForType(radiatorType);
    if (variants.length && !variants.some(v => v.groupId === connGroup && v.code === connCode)) {
      setConnGroup(variants[0].groupId);
      setConnCode(variants[0].code);
    }
    const heights = radiatorType === 'Cambiotherm' ? CAMBIOTHERM_HEIGHTS : AVAILABLE_HEIGHTS;
    if (!heights.includes(height)) {
      setHeight(heights[0]);
    }
    const validSizes = radiatorType === 'RRV' ? ['12', '84'] : ['38', '12', '34', '10'];
    if (!validSizes.includes(connSize)) {
      setConnSize('12');
    }
    const validVentSizes = radiatorType === 'RRV' ? ['12', '84'] : ['12', '34'];
    if (!validVentSizes.includes(ventConnSize)) {
      setVentConnSize('12');
    }
  }, [radiatorType]);

  const deltaT = calculateDeltaT(flowTemp, returnTemp, airTemp);
  const availableHeights = radiatorType === 'Cambiotherm' ? CAMBIOTHERM_HEIGHTS : AVAILABLE_HEIGHTS;
  const seriesMaxHeight = availableHeights.length ? Math.max(...availableHeights) : 3000;
  const seriesMaxLength = MAX_SECTIONS * SECTION_LENGTH;

  const handleMinHeightChange = (value) => {
    setMinHeight(value);
    const proposedMax = Number(value) + 200;
    setMaxHeight(Math.min(proposedMax, seriesMaxHeight));
  };

  const handleMinLengthChange = (value) => {
    setMinLength(value);
    const proposedMax = Number(value) + 200;
    setMaxLength(Math.min(proposedMax, seriesMaxLength));
  };

  const results = useMemo(() => {
    if (!height || deltaT <= 0) return [];
    let res;
    if (selectedSections) {
      res = calculateResultsBySize(height, selectedSections * SECTION_LENGTH, deltaT);
    } else if (requiredPower) {
      res = calculateResults(height, requiredPower, deltaT);
    } else {
      return [];
    }
    if (selectedTubes) res = res.filter(r => r.tubes === selectedTubes);
    if (!selectedSections) {
      // Adjust section count to fit within the length range.
      // calculateResults gives minimum sections for power; if that length is below minLength,
      // bump sections up to the smallest count that fits.
      const minLen = Number(minLength || 0);
      const maxLen = Number(maxLength || 99999);
      res = res.map(r => {
        const lowerByLength = Math.ceil(minLen / SECTION_LENGTH);
        const upperByLength = Math.floor(maxLen / SECTION_LENGTH);
        const effMin = Math.max(r.sections, lowerByLength);
        const effMax = Math.min(getMaxSections(r.model), upperByLength);
        if (effMin > effMax) return null;
        if (effMin === r.sections) return r;
        const sections = effMin;
        const weightPerSection = r.sections > 0 ? r.totalWeight / r.sections : 0;
        return {
          ...r,
          sections,
          length: sections * SECTION_LENGTH,
          qNomTotal: r.power * sections,
          qRealTotal: Math.round(r.qRealPerSection * sections),
          basePrice: Math.round(r.price * sections * 100) / 100,
          totalWeight: Math.round(weightPerSection * sections * 10) / 10,
          bracketCount: getBracketCount(r.tubes, r.height, sections),
        };
      }).filter(Boolean).sort((a, b) => a.basePrice - b.basePrice);
    }
    return res;
  }, [height, selectedSections, requiredPower, deltaT, selectedTubes, minLength, maxLength]);

  const sectionVariants = useMemo(() => {
    if (!results.length) return [];
    const base = results[0];
    const weightPerSection = base.sections > 0 ? base.totalWeight / base.sections : 0;
    const variants = [];
    for (let i = 0; i < 4; i++) {
      const sections = base.sections + i;
      if (sections > getMaxSections(base.model)) break;
      const length = sections * SECTION_LENGTH;
      if (maxLength && length > Number(maxLength)) break;
      variants.push({
        ...base,
        sections,
        length,
        qNomTotal: base.power * sections,
        qRealTotal: Math.round(base.qRealPerSection * sections),
        basePrice: Math.round(base.price * sections * 100) / 100,
        totalWeight: Math.round(weightPerSection * sections * 10) / 10,
        bracketCount: getBracketCount(base.tubes, base.height, sections),
      });
    }
    return variants;
  }, [results, maxLength]);

  // Каскадная динамическая фильтрация: опции шага 2 пересчитываются
  // с учётом уже выбранных трубок и высоты
  const availableOptions = useMemo(() => {
    const tubes = new Set();
    const heights = new Set();
    const sections = new Set();
    if (deltaT > 0 && requiredPower) {
      const heightsInRange = availableHeights.filter(h => h >= Number(minHeight || 0) && h <= Number(maxHeight || 99999));
      heightsInRange.forEach(h => {
        const res = calculateResults(h, requiredPower, deltaT);
        let heightValid = false;
        res.forEach(r => {
          // Check if any section count from r.sections to getMaxSections
          // produces a length within [minLength, maxLength].
          const minLen = Number(minLength || 0);
          const maxLen = Number(maxLength || 99999);
          const lowerByLength = Math.ceil(minLen / SECTION_LENGTH);
          const upperByLength = Math.floor(maxLen / SECTION_LENGTH);
          const effMin = Math.max(r.sections, lowerByLength);
          const effMax = Math.min(getMaxSections(r.model), upperByLength);
          if (effMin > effMax) return;
          if (!selectedTubes || selectedTubes === r.tubes) heightValid = true;
          if (!height || height === h) tubes.add(r.tubes);
          if ((!height || height === h) && (!selectedTubes || selectedTubes === r.tubes)) {
            for (let s = effMin; s <= effMax; s++) sections.add(s);
          }
        });
        if (heightValid) heights.add(h);
      });
    }
    return { tubes, heights, sections };
  }, [availableHeights, minHeight, maxHeight, minLength, maxLength, requiredPower, deltaT, selectedTubes, height]);

  // Сброс невалидных выборов при каскадной фильтрации
  useEffect(() => {
    if (selectedTubes && availableOptions.tubes.size > 0 && !availableOptions.tubes.has(selectedTubes)) {
      setSelectedTubes(null);
    }
  }, [availableOptions, selectedTubes]);

  useEffect(() => {
    if (height && availableOptions.heights.size > 0 && !availableOptions.heights.has(height)) {
      const first = [...availableOptions.heights].sort((a, b) => a - b)[0];
      setHeight(first || null);
    }
  }, [availableOptions, height]);

  useEffect(() => {
    if (selectedSections && availableOptions.sections.size > 0 && !availableOptions.sections.has(selectedSections)) {
      setSelectedSections(null);
    }
  }, [availableOptions, selectedSections]);

  // Сброс размера подключения при выборе варианта с ограничением размеров
  useEffect(() => {
    const connNum = (connCode || '').replace(/\D/g, '');
    const restricted = CONNECTION_SIZE_RESTRICTIONS[connNum];
    if (restricted && !restricted.includes(connSize)) {
      setConnSize(restricted[0]);
    }
  }, [connCode]);

  // Автовыбор позиции воздухоотводчика по типу подключения
  useEffect(() => {
    if (!ventType) return;
    const num = (connCode || '').replace(/\D/g, '');
    if (radiatorType === 'RRV') {
      setVentPosition(['69', '98'].includes(num) ? '3' : '1');
    } else {
      setVentPosition(['12', '14', '68', '69'].includes(num) ? '3' : '1');
    }
  }, [connCode, ventType, radiatorType]);

  // При изменении базовых параметров — сброс к самому дешёвому варианту
  useEffect(() => {
    if (!showResults) return;
    setSelectedTubes(null);
    setSelectedSections(null);
  }, [radiatorType, requiredPower, minHeight, maxHeight, minLength, maxLength, deltaT]);

  // Автовыбор самого дешёвого варианта
  useEffect(() => {
    if (!showResults) return;
    if (results.length > 0) {
      const cheapest = results[0];
      setSelected(cheapest);
      if (selectedTubes !== cheapest.tubes) setSelectedTubes(cheapest.tubes);
      if (selectedSections !== cheapest.sections) setSelectedSections(cheapest.sections);
    } else {
      setSelected(null);
    }
  }, [results, showResults]);

  const hasNoVariants = availableOptions.heights.size === 0;

  const previewValveType = findConnectionVariant(connGroup, connCode)?.valveType || '';
  const totalPrice = selected
    ? calculateTotalPrice(selected.basePrice, colorCode, connGroup, connCode, highPressure, ventType, previewValveType)
    : 0;
  const article = useMemo(() => {
    if (selected) {
      return buildArticle(radiatorType, selected.model, selected.sections, connGroup, connCode, ralCode, colorCode, highPressure, ventType, ventPosition, connSize, includeBracketKLK);
    }
    if (selectedSections && results.length > 0) {
      const match = selectedTubes ? results.find(r => r.tubes === selectedTubes) : null;
      const r = match || results[0];
      return buildArticle(radiatorType, r.model, r.sections, connGroup, connCode, ralCode, colorCode, highPressure, ventType, ventPosition, connSize, includeBracketKLK);
    }
    return buildArticle(radiatorType, '', 0, connGroup, connCode, ralCode, colorCode, highPressure, ventType, ventPosition, connSize, includeBracketKLK);
  }, [selected, selectedSections, selectedTubes, results, radiatorType, connGroup, connCode, ralCode, colorCode, ventType, ventPosition, connSize, includeBracketKLK]);

  const config = { colorCode, connGroup, connCode, highPressure, ventType, ventPosition, deltaT: deltaT.toFixed(1) };

  const previewSections = selected?.sections || selectedSections || 9;
  const previewHeight = height || 600;
  const previewConn = connCode || 'N12';
  const previewColor = getRalColor(ralCode).hex;

  const handleFind = () => {
    setShowResults(true);
  };

  return (
    <div className="min-h-screen lg:h-screen bg-background flex flex-col lg:flex-row lg:overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full lg:w-[400px] shrink-0 bg-background flex flex-col lg:overflow-hidden">
        <div className="px-4 flex items-center min-h-[68px] bg-background border-b border-border/30 shrink-0">
          <button
            onClick={() => setShowReset(true)}
            className="text-[14px] font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Новый подбор
          </button>
        </div>

        <div className="flex-1 lg:overflow-y-auto p-4 space-y-7">
          <ModelSeries
            radiatorType={radiatorType}
            setRadiatorType={setRadiatorType}
          />
          <BaseParameters
            requiredPower={requiredPower} setRequiredPower={setRequiredPower}
            flowTemp={flowTemp} setFlowTemp={setFlowTemp}
            returnTemp={returnTemp} setReturnTemp={setReturnTemp}
            airTemp={airTemp} setAirTemp={setAirTemp}
            minHeight={minHeight} setMinHeight={handleMinHeightChange}
            maxHeight={maxHeight} setMaxHeight={setMaxHeight}
            minLength={minLength} setMinLength={handleMinLengthChange}
            maxLength={maxLength} setMaxLength={setMaxLength}
          />

          {!showResults ? (
            <button
              onClick={handleFind}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-premium bg-primary text-primary-foreground text-[14px] font-bold hover:bg-primary/90 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Подобрать варианты
            </button>
          ) : hasNoVariants ? (
            <div className="py-10 text-center">
              <p className="text-[14px] font-semibold text-foreground">Не нашли подходящих вариантов</p>
              <p className="text-[12px] text-muted-foreground mt-1">Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            <>
              <div className="pt-6 border-t border-border/30">
                <div className="text-[16px] font-bold text-foreground">Подходящие варианты</div>
              </div>
              {/* Шаг 2: уточнение и заказ */}
              <ExtendedParameters
                selectedTubes={selectedTubes} setSelectedTubes={setSelectedTubes}
                height={height} setHeight={setHeight}
                availableHeights={availableHeights}
                minHeight={minHeight} maxHeight={maxHeight}
                minLength={minLength} maxLength={maxLength}
                selectedSections={selectedSections} setSelectedSections={setSelectedSections}
                availableOptions={availableOptions}
                sectionVariants={sectionVariants}
                selected={selected}
                onSelectVariant={setSelected}
              />
              <ConnectionVariants
                radiatorType={radiatorType}
                connGroup={connGroup} setConnGroup={setConnGroup}
                connCode={connCode} setConnCode={setConnCode}
                connSize={connSize} setConnSize={setConnSize}
              />
              <AirVent
                radiatorType={radiatorType}
                ventType={ventType} setVentType={setVentType}
                ventConnSize={ventConnSize} setVentConnSize={setVentConnSize}
                includeBracketKLK={includeBracketKLK} setIncludeBracketKLK={setIncludeBracketKLK}
                highPressure={highPressure} setHighPressure={setHighPressure}
                drainValve={drainValve} setDrainValve={setDrainValve}
              />
              <SidebarFinish
                ralCode={ralCode} setRalCode={setRalCode}
                colorCode={colorCode} setColorCode={setColorCode}
              />
            </>
          )}


        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col lg:overflow-hidden">
        {(showResults && !hasNoVariants) && (
          <header className="px-6 border-b border-border/50 shrink-0">
          <div className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:min-h-[68px] lg:py-0">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Артикул вашего радиатора</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[12px] sm:text-[15px] lg:text-[18px] font-bold text-foreground whitespace-nowrap lg:break-all">{article}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(article); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                  title="Копировать артикул"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            {selected && (
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4 lg:shrink-0">
                <div className="text-left lg:text-right">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Цена</div>
                  <div className="text-[16px] font-bold text-foreground">{formatEuro(totalPrice)}</div>
                </div>
                <button
                  onClick={() => setShowOrderModal(true)}
                  className="w-full lg:w-auto px-5 py-2.5 rounded-premium bg-[#685ef0] text-white text-[13px] font-bold hover:bg-[#5848d4] transition-all"
                >
                  Добавить в заказ
                </button>
              </div>
            )}
          </div>
          <RadiatorSpecsTable
            selected={selected}
            totalPrice={totalPrice}
            deltaT={deltaT}
            colorCode={colorCode}
            ralCode={ralCode}
            connGroup={connGroup}
            connCode={connCode}
            radiatorType={radiatorType}
            valveType={previewValveType}
            highPressure={highPressure}
            ventType={ventType}
            ventPosition={ventPosition}
            connSize={connSize}
            ventConnSize={ventConnSize}
            drainValve={drainValve}
          />
          </header>
        )}
        <div className="flex-1 lg:overflow-y-auto bg-background">
          <RadiatorServerPreview
            sections={previewSections}
            height={previewHeight}
            connectionCode={previewConn}
            valveType={previewValveType}
            color={previewColor}
            ventType={ventType}
          />


        </div>
      </main>

      <ResetConfirmDialog
        open={showReset}
        result={selected}
        article={article}
        totalPrice={totalPrice}
        onConfirm={handleReset}
        onCancel={() => setShowReset(false)}
      />
      <OrderModal
        open={showOrderModal}
        onOpenChange={setShowOrderModal}
        article={article}
        result={selected}
        totalPrice={totalPrice}
        quantity={quantity}
        setQuantity={setQuantity}
        config={config}
      />
    </div>
  );
}