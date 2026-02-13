'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Trash, FloppyDisk, CaretRight, User, Drop, Target, Fire, Cookie, CircleNotch, X, MagnifyingGlass, Copy, Calculator } from '@phosphor-icons/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import FoodSearchPanel from './FoodSearchPanel';
import { saveFullNutritionalPlan, getStudentMetrics, searchFoods } from '@/app/actions/dietUtils';
import { deleteNutritionalPlan } from '@/app/actions/nutrition';
import { useRouter } from 'next/navigation';
import ConfirmationModal, { ConfirmationVariant } from '@/components/ui/ConfirmationModal';
import Link from 'next/link';
import MetabolicCalculatorModal from './MetabolicCalculatorModal';
import MacroDashboard from './MacroDashboard';

// --- Types ---
interface FoodItem {
    id: string; // unique instance id
    foodId?: string;
    name: string;
    portion: number; // g
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    source?: string;
}

interface Meal {
    id: string;
    name: string;
    time: string;
    items: FoodItem[];
}

interface SmartMealBuilderProps {
    studentId?: string; // Optional for templates
    students?: { id: string, name: string }[]; // Optional list for selection
    initialPlan?: any; // If editing
    isTemplate?: boolean;
}

export default function SmartMealBuilder({ studentId: propStudentId, initialPlan, students, isTemplate: initialIsTemplate = false }: SmartMealBuilderProps) {
    const router = useRouter();

    // --- State ---
    const [title, setTitle] = useState(initialPlan?.title || (initialIsTemplate ? "Novo Modelo de Dieta" : "Nova Dieta"));
    const [isTemplate, setIsTemplate] = useState(initialIsTemplate || initialPlan?.isTemplate || false);
    const [selectedStudentId, setSelectedStudentId] = useState(initialPlan?.studentId || propStudentId || "");
    const [waterGoal, setWaterGoal] = useState(initialPlan?.waterGoalMl || 2500);
    const [meals, setMeals] = useState<Meal[]>(initialPlan?.meals || []);
    const [targets, setTargets] = useState({
        kcal: initialPlan?.dailyKcal || 2000,
        protein: initialPlan?.proteinG || 160,
        carbs: initialPlan?.carbsG || 200,
        fat: initialPlan?.fatG || 60
    });
    const [selectedDays, setSelectedDays] = useState<string[]>(initialPlan?.daysOfWeek || []);

    // UI State
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isScanning, setIsScanning] = useState(false); // For "AI" or future features
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeMealId, setActiveMealId] = useState<string | null>(null); // For adding food to specific meal
    const [isFoodPanelOpen, setIsFoodPanelOpen] = useState(false);

    // Calculator State
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [studentMetrics, setStudentMetrics] = useState<any>(null);

    // Fetch Metrics when student selected
    useEffect(() => {
        if (selectedStudentId) {
            getStudentMetrics(selectedStudentId).then(data => {
                if (data) setStudentMetrics(data);
            });
        } else {
            setStudentMetrics(null);
        }
    }, [selectedStudentId]);

    // Confirmation Modal
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        variant?: ConfirmationVariant;
        confirmText?: string;
        cancelText?: string | null;
        onConfirm: () => void;
        isLoading?: boolean;
    } | null>(null);

    // --- Computed ---
    const totals = useMemo(() => {
        return meals.reduce((acc, meal) => {
            meal.items.forEach(item => {
                acc.kcal += item.calories;
                acc.protein += item.protein;
                acc.carbs += item.carbs;
                acc.fat += item.fat;
            });
            return acc;
        }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
    }, [meals]);

    // --- Handlers ---
    const addMeal = () => {
        const newMeal: Meal = {
            id: crypto.randomUUID(),
            name: `Refeição ${meals.length + 1}`,
            time: '12:00',
            items: []
        };
        setMeals([...meals, newMeal]);
    };

    const removeMeal = (id: string) => {
        setMeals(meals.filter(m => m.id !== id));
    };

    const handleAddFood = (food: any) => {
        // Add to the active meal if selected, otherwise the first one, or create one
        let targetId = activeMealId;
        if (!targetId && meals.length > 0) targetId = meals[0].id;

        if (!targetId) {
            const newMeal: Meal = {
                id: crypto.randomUUID(),
                name: `Refeição 1`,
                time: '08:00',
                items: []
            };
            setMeals([newMeal]);
            targetId = newMeal.id;
        }

        const newItem: FoodItem = {
            id: crypto.randomUUID(),
            foodId: food.id,
            name: food.name,
            portion: food.baseAmount,
            unit: food.baseUnit || 'g',
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            source: food.source
        };

        setMeals(prev => prev.map(m => {
            if (m.id === targetId) {
                return { ...m, items: [...m.items, newItem] };
            }
            return m;
        }));
    };

    const updateFoodPortion = (mealId: string, itemId: string, newPortion: number) => {
        setMeals(prev => prev.map(m => {
            if (m.id !== mealId) return m;
            return {
                ...m,
                items: m.items.map(item => {
                    if (item.id !== itemId) return item;
                    // Simple linear scaling (assuming macros are per portion unit)
                    // Note: Ideally we'd need base macros per 100g/1unit to scale perfectly if the item stores current values.
                    // For now, assuming standard linear scaling from current state isn't perfect without base reference.
                    // In a real app, `item` should store `baseMacros` and calculate `displayedMacros` on the fly.
                    const ratio = newPortion / (item.portion || 1);
                    return {
                        ...item,
                        portion: newPortion,
                        calories: Math.round(item.calories * ratio),
                        protein: Number((item.protein * ratio).toFixed(1)),
                        carbs: Number((item.carbs * ratio).toFixed(1)),
                        fat: Number((item.fat * ratio).toFixed(1)),
                    };
                })
            };
        }));
    };

    const onDragEnd = (result: any) => {
        const { source, destination } = result;
        if (!destination) return;

        if (source.droppableId === destination.droppableId) {
            const mealIndex = meals.findIndex(m => m.id === source.droppableId);
            const newItems = Array.from(meals[mealIndex].items);
            const [reorderedItem] = newItems.splice(source.index, 1);
            newItems.splice(destination.index, 0, reorderedItem);

            const newMeals = [...meals];
            newMeals[mealIndex].items = newItems;
            setMeals(newMeals);
        } else {
            const sourceMealIndex = meals.findIndex(m => m.id === source.droppableId);
            const destMealIndex = meals.findIndex(m => m.id === destination.droppableId);

            const sourceItems = Array.from(meals[sourceMealIndex].items);
            const destItems = Array.from(meals[destMealIndex].items);
            const [movedItem] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, movedItem);

            const newMeals = [...meals];
            newMeals[sourceMealIndex].items = sourceItems;
            newMeals[destMealIndex].items = destItems;
            setMeals(newMeals);
        }
    };

    const handleSave = async () => {
        setConfirmationModal({
            isOpen: true,
            title: "Salvar Dieta",
            description: "Deseja salvar as alterações neste plano nutricional?",
            confirmText: "Salvar",
            cancelText: "Cancelar",
            onConfirm: async () => {
                setConfirmationModal(prev => prev ? { ...prev, isLoading: true } : null);
                try {
                    await saveFullNutritionalPlan({
                        planId: initialPlan?.id, // Pass ID for update
                        studentId: selectedStudentId || null,
                        isTemplate: isTemplate,
                        title,
                        dailyKcal: targets.kcal,
                        proteinG: targets.protein,
                        carbsG: targets.carbs,
                        fatG: targets.fat,
                        waterGoalMl: waterGoal,
                        daysOfWeek: selectedDays,
                        meals: meals.map((m, i) => ({
                            name: m.name,
                            time: m.time,
                            order: i,
                            items: m.items.map(item => ({
                                foodId: item.foodId,
                                name: item.name,
                                portion: item.portion,
                                unit: item.unit,
                                calories: item.calories,
                                protein: item.protein,
                                carbs: item.carbs,
                                fat: item.fat
                            }))
                        }))
                    });
                    // Success
                    if (isTemplate) {
                        router.push('/dashboard/nutrition/templates');
                    } else if (students) {
                        // Was in creation flow
                        router.push('/dashboard/nutrition');
                    } else {
                        router.back();
                    }
                } catch (error) {
                    console.error(error);
                    // Show error modal?
                } finally {
                    setConfirmationModal(null);
                }
            }
        });
    };

    const handleDelete = async () => {
        if (!initialPlan?.id) return;

        setConfirmationModal({
            isOpen: true,
            title: "Excluir Dieta",
            description: "Tem certeza que deseja excluir esta dieta? Esta ação não pode ser desfeita.",
            variant: "danger",
            confirmText: "Sim, excluir",
            cancelText: "Cancelar",
            onConfirm: async () => {
                setConfirmationModal(prev => prev ? { ...prev, isLoading: true } : null);
                setIsDeleting(true);
                try {
                    await deleteNutritionalPlan(initialPlan.id, selectedStudentId);
                    if (isTemplate) {
                        router.push('/dashboard/nutrition/templates');
                    } else {
                        router.back();
                    }
                } catch (error) {
                    console.error(error);
                    setConfirmationModal({
                        isOpen: true,
                        title: "Erro ao Excluir",
                        description: "Não foi possível excluir a dieta.",
                        variant: "danger",
                        confirmText: "Entendi",
                        cancelText: null,
                        onConfirm: () => setConfirmationModal(null)
                    });
                    setIsDeleting(false);
                }
            }
        });
    };

    // Toggle Food Panel
    const toggleFoodPanel = (mealId?: string) => {
        if (mealId) setActiveMealId(mealId);
        setIsFoodPanelOpen(true);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-24 relative font-primary">
            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {isEditingTitle ? (
                        <input
                            autoFocus
                            className="text-3xl font-extrabold text-graphite-dark bg-transparent border-b-2 border-performance-green outline-none"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => setIsEditingTitle(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                        />
                    ) : (
                        <h1
                            className="text-3xl font-extrabold text-graphite-dark tracking-tight cursor-pointer hover:text-slate-600 transition-colors flex items-center gap-2"
                            onClick={() => setIsEditingTitle(true)}
                        >
                            {title}
                            <span className="text-slate-300 text-lg">✎</span>
                        </h1>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {initialPlan && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-3 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-colors disabled:opacity-50"
                            title="Excluir Dieta"
                        >
                            <Trash size={24} weight="bold" />
                        </button>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-xl border border-slate-100 soft-shadow">
                        <input
                            type="checkbox"
                            className="w-5 h-5 accent-performance-green rounded-lg"
                            checked={isTemplate}
                            onChange={(e) => setIsTemplate(e.target.checked)}
                        />
                        <span className="font-bold text-slate-600 text-sm">Salvar como Modelo</span>
                    </label>
                    <button
                        onClick={handleSave}
                        className={`flex items-center gap-2 px-6 py-3 text-graphite-dark font-bold rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all ${isTemplate ? 'bg-amber-400' : 'bg-performance-green'}`}
                    >
                        <FloppyDisk size={24} weight="bold" />
                        {isTemplate ? "Salvar Modelo" : "Salvar Dieta"}
                    </button>
                </div>
            </div>


            {/* Dashboard */}
            <MacroDashboard
                student={studentMetrics}
                targets={targets}
                current={totals}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Left Column: Meals (2/3) --- */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-slate-50/50 p-1 rounded-[32px] border border-slate-100 h-full">
                        <div className="bg-pure-white rounded-[28px] soft-shadow p-6 min-h-[600px]">
                            {/* Header inside Card */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="flex items-center gap-2 text-xl font-bold text-graphite-dark">
                                    <Cookie size={24} className="text-performance-green" weight="duotone" />
                                    Refeições
                                </h3>
                                <button
                                    onClick={addMeal}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center gap-2"
                                >
                                    <Plus size={16} weight="bold" /> Nova Refeição
                                </button>
                            </div>

                            <DragDropContext onDragEnd={onDragEnd}>
                                <div className="space-y-6">
                                    {meals.map((meal, index) => (
                                        <Droppable key={meal.id} droppableId={meal.id}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className={`bg-white p-6 rounded-[24px] border transition-all relative group ${snapshot.isDraggingOver ? 'border-performance-green ring-2 ring-emerald-100' : 'border-slate-100 shadow-sm'}`}
                                                >
                                                    {/* Meal Header */}
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-sm font-bold text-slate-400 border border-slate-100">
                                                                {index + 1}
                                                            </div>
                                                            <div>
                                                                <input
                                                                    value={meal.name}
                                                                    onChange={(e) => {
                                                                        const newMeals = [...meals];
                                                                        newMeals[index].name = e.target.value;
                                                                        setMeals(newMeals);
                                                                    }}
                                                                    className="font-extrabold text-graphite-dark text-lg bg-transparent outline-none focus:text-emerald-600 transition-colors w-full"
                                                                    placeholder="Nome da Refeição"
                                                                />
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <input
                                                                        type="time"
                                                                        value={meal.time}
                                                                        onChange={(e) => {
                                                                            const newMeals = [...meals];
                                                                            newMeals[index].time = e.target.value;
                                                                            setMeals(newMeals);
                                                                        }}
                                                                        className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg cursor-pointer hover:bg-slate-100"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-right mr-2">
                                                                <div className="text-xs font-bold text-slate-300 uppercase">Total</div>
                                                                <div className="text-right mr-2 hidden sm:block">
                                                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Total</div>
                                                                    <div className="text-sm font-black text-slate-600">
                                                                        {meal.items.reduce((acc, i) => acc + i.calories, 0)} kcal
                                                                    </div>
                                                                </div>

                                                                {/* Duplicate Meal */}
                                                                <button
                                                                    onClick={() => {
                                                                        const newMeal: Meal = {
                                                                            ...meal,
                                                                            id: crypto.randomUUID(),
                                                                            name: `${meal.name} (Cópia)`,
                                                                            items: meal.items.map(item => ({ ...item, id: crypto.randomUUID() }))
                                                                        };
                                                                        setMeals([...meals, newMeal]);
                                                                    }}
                                                                    className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                                                                    title="Duplicar Refeição"
                                                                >
                                                                    <Copy size={20} weight="bold" />
                                                                </button>

                                                                <button
                                                                    onClick={() => removeMeal(meal.id)}
                                                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                                                    title="Remover Refeição"
                                                                >
                                                                    <Trash size={20} weight="bold" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Items List */}
                                                    <div className="space-y-3 min-h-[10px]">
                                                        {meal.items.map((item, itemIndex) => (
                                                            <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                                                {(provided, snapshot) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className={`flex justify-between items-center p-4 rounded-xl border border-transparent transition-all group/item ${snapshot.isDragging ? 'bg-white shadow-xl rotate-1 ring-1 ring-emerald-200 z-50' : 'bg-slate-50 hover:bg-white hover:shadow-sm hover:border-slate-100'}`}
                                                                    >
                                                                        <div className="flex-1">
                                                                            <div className="font-bold text-slate-700 text-sm mb-1">{item.name}</div>
                                                                            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                                                                <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                                                                                    <input
                                                                                        type="number"
                                                                                        value={item.portion}
                                                                                        onChange={(e) => updateFoodPortion(meal.id, item.id, Number(e.target.value))}
                                                                                        className="w-8 text-center bg-transparent outline-none font-bold text-slate-600"
                                                                                    />
                                                                                    <span>{item.unit}</span>
                                                                                </div>
                                                                                <span>•</span>
                                                                                <span>{item.calories} kcal</span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Macros Mini Pill */}
                                                                        <div className="hidden sm:flex gap-2 text-[10px] font-black uppercase text-slate-300 mr-4">
                                                                            <span className="text-emerald-400">P {item.protein}</span>
                                                                            <span className="text-blue-400">C {item.carbs}</span>
                                                                            <span className="text-orange-400">G {item.fat}</span>
                                                                        </div>

                                                                        <button
                                                                            onClick={() => {
                                                                                const newItems = meal.items.filter(i => i.id !== item.id);
                                                                                const newMeals = [...meals];
                                                                                newMeals[index].items = newItems;
                                                                                setMeals(newMeals);
                                                                            }}
                                                                            className="opacity-0 group-hover/item:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                                                                        >
                                                                            <X size={14} weight="bold" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>

                                                    {/* Add Food Button */}
                                                    <button
                                                        onClick={() => toggleFoodPanel(meal.id)}
                                                        className="mt-4 w-full py-3 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm font-bold hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Plus size={16} weight="bold" />
                                                        Adicionar Alimento
                                                    </button>
                                                </div>
                                            )}
                                        </Droppable>
                                    ))}

                                    {meals.length === 0 && (
                                        <div className="text-center py-12">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                <Cookie size={40} weight="duotone" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-500">Nenhuma refeição criada</h3>
                                            <p className="text-slate-400 text-sm">Comece adicionando a primeira refeição do dia.</p>
                                        </div>
                                    )}
                                </div>
                            </DragDropContext>
                        </div>
                    </div>
                </div>

                {/* --- Right Column: Stats & Info (1/3) --- */}
                <div className="space-y-6">
                    {/* Info Box with Student Selector */}
                    {!isTemplate && (
                        <div className="bg-pure-white p-6 rounded-[24px] soft-shadow border border-slate-50">
                            <h3 className="flex items-center gap-2 text-md font-bold text-graphite-dark mb-4">
                                <User size={20} weight="duotone" className="text-emerald-500" />
                                Info
                            </h3>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Aluno</label>
                                {students ? (
                                    <select
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-600 outline-none focus:border-emerald-500 transition-colors"
                                    >
                                        <option value="" disabled>Selecione um aluno...</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="font-bold text-slate-600 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                                        {studentMetrics?.name || "Carregando..."}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Macros Box */}
                    <div className="bg-pure-white p-6 rounded-[24px] soft-shadow border border-slate-50">
                        <h3 className="flex items-center gap-2 text-md font-bold text-graphite-dark mb-6">
                            <Target size={20} className="text-blue-500" weight="duotone" />
                            Metas Diárias
                        </h3>

                        <button
                            onClick={() => setIsCalculatorOpen(true)}
                            className="w-full mb-6 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-[1.02] transition-all"
                        >
                            <Calculator size={20} weight="bold" />
                            Calculadora Metabólica
                        </button>

                        <div className="space-y-4">
                            {/* Calories */}
                            <div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1">
                                    <span className="text-slate-500">Calorias ({totals.kcal})</span>
                                    <span className={totals.kcal > targets.kcal ? 'text-rose-500' : 'text-slate-400'}>Meta: {targets.kcal}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                                    <div className={`h-full bg-slate-800 transition-all`} style={{ width: `${Math.min((totals.kcal / targets.kcal) * 100, 100)}%` }} />
                                </div>
                                <input
                                    type="number"
                                    value={targets.kcal}
                                    onChange={e => setTargets({ ...targets, kcal: Number(e.target.value) })}
                                    className="w-full bg-slate-50 p-2 rounded-lg text-sm font-bold text-slate-600 outline-none focus:bg-white focus:ring-2 focus:ring-slate-100"
                                />
                            </div>

                            {/* Macros Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                <MacroInput
                                    label="Prot"
                                    current={totals.protein}
                                    target={targets.protein}
                                    color="emerald"
                                    onChange={(v: number) => setTargets({ ...targets, protein: v })}
                                />
                                <MacroInput
                                    label="Carb"
                                    current={totals.carbs}
                                    target={targets.carbs}
                                    color="blue"
                                    onChange={(v: number) => setTargets({ ...targets, carbs: v })}
                                />
                                <MacroInput
                                    label="Gord"
                                    current={totals.fat}
                                    target={targets.fat}
                                    color="orange"
                                    onChange={(v: number) => setTargets({ ...targets, fat: v })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Water & Days */}
                    <div className="bg-pure-white p-6 rounded-[24px] soft-shadow border border-slate-50 space-y-6">
                        {/* Water */}
                        <div>
                            <h3 className="flex items-center gap-2 text-md font-bold text-graphite-dark mb-4">
                                <Drop size={20} className="text-blue-400" weight="duotone" />
                                Hidratação
                            </h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={waterGoal}
                                    onChange={e => setWaterGoal(Number(e.target.value))}
                                    className="flex-1 bg-slate-50 p-3 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                                />
                                <span className="text-sm font-bold text-slate-400">ml/dia</span>
                            </div>
                        </div>

                        {/* Days */}
                        <div>
                            <h3 className="flex items-center gap-2 text-md font-bold text-graphite-dark mb-4">
                                <Fire size={20} className="text-orange-500" weight="duotone" />
                                Dias da Semana
                            </h3>
                            <div className="flex gap-1 justify-between">
                                {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => {
                                    const dayStr = String(i);
                                    const isSelected = selectedDays.includes(dayStr);
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedDays(prev => isSelected ? prev.filter(x => x !== dayStr) : [...prev, dayStr])}
                                            className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${isSelected ? 'bg-orange-500 text-white shadow-md shadow-orange-200 scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            {d}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Drawer / Sidebar for Food Search --- */}

            <MetabolicCalculatorModal
                isOpen={isCalculatorOpen}
                onClose={() => setIsCalculatorOpen(false)}
                initialMetrics={studentMetrics}
                onApply={(newTargets) => {
                    setTargets(newTargets);
                }}
            />
            {
                isFoodPanelOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity"
                            onClick={() => setIsFoodPanelOpen(false)}
                        />
                        <div className="fixed top-0 right-0 h-full w-[400px] bg-white z-40 shadow-2xl animate-in slide-in-from-right duration-300">
                            <div className="h-full flex flex-col">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-bold text-graphite-dark text-lg">Adicionar Alimento</h3>
                                    <button onClick={() => setIsFoodPanelOpen(false)} className="p-2 hover:bg-slate-50 rounded-full">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <FoodSearchPanel onAddFood={(food) => {
                                        handleAddFood(food);
                                        // Optional: Don't close panel to allow multiple adds
                                        // setIsFoodPanelOpen(false); 
                                    }} />
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

            {
                confirmationModal && (
                    <ConfirmationModal
                        isOpen={confirmationModal.isOpen}
                        title={confirmationModal.title}
                        description={confirmationModal.description}
                        variant={confirmationModal.variant}
                        confirmText={confirmationModal.confirmText}
                        cancelText={confirmationModal.cancelText}
                        onConfirm={confirmationModal.onConfirm}
                        isLoading={confirmationModal.isLoading}
                        onClose={() => setConfirmationModal(null)}
                    />
                )
            }
        </div >
    );
}

function MacroInput({ label, current, target, color, onChange }: any) {
    const colorClass = {
        emerald: 'text-emerald-500',
        blue: 'text-blue-500',
        orange: 'text-orange-500'
    }[color as string];

    const bgClass = {
        emerald: 'bg-emerald-500',
        blue: 'bg-blue-500',
        orange: 'bg-orange-500'
    }[color as string];

    return (
        <div className="bg-slate-50 p-2 rounded-xl">
            <div className={`text-[10px] font-black uppercase mb-1 ${colorClass}`}>{label}</div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div className={`h-full ${bgClass}`} style={{ width: `${Math.min((current / target) * 100, 100)}%` }} />
            </div>
            <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-400">{current}/</span>
                <input
                    type="number"
                    value={target}
                    onChange={e => onChange(Number(e.target.value))}
                    className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none min-w-0"
                />
            </div>
        </div>
    );
}
