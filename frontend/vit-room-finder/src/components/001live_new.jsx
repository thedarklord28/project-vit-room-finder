import React, { useState, useEffect, useRef } from 'react'
import classData from "../../rawdata/rooms.json"
import slotData from "../../rawdata/slotTimings.json"


import MenuIcon from '@mui/icons-material/Menu';

import { motion } from 'framer-motion';
import CountUp from '../reactbits/CountUp.jsx'



export default function Live() {
    const [activeTheorySlot, setActiveTheorySlot] = useState(null);
    const [activeLabSlot, setActiveLabSlot] = useState(null);

    const [curDay, setCurDay] = useState('');
    const [curTime, setCurTime] = useState('');
    const [allFreeRooms, setAllFreeRooms] = useState(null);

    const [hideOccupied, setHideOccupied] = useState(false);
    const [isCustomTime, setIsCustomTime] = useState(false);

    const [selectedBlock, setSelectedBlock] = useState(null);
    const [isSelectedBlock, setIsSelectedBlock] = useState(null);

    const scrollRef = useRef(null);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(false);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        const isOverflowing = el.scrollWidth > el.clientWidth + 4;

        setShowLeftFade(isOverflowing && el.scrollLeft > 4);
        setShowRightFade(
            isOverflowing &&
            el.scrollLeft + el.clientWidth < el.scrollWidth - 4
        );
    };
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(handleScroll);
        });

        observer.observe(el);

        handleScroll();

        return () => observer.disconnect();
    }, []);

    const BLOCKS = [...new Set(
        Object.values(classData.rooms).map(r => r.block).filter(Boolean)
    )].sort();




    useEffect(() => {
        if (isCustomTime) return;

        const updateClock = () => {
            const now = new Date();
            const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

            const currentDay = days[now.getDay()];
            //const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const currentTimeStr = '09:30';
            //setCurDay(currentDay);
            setCurDay('FRI');
            setCurTime(currentTimeStr);
        };

        updateClock();

        const timerId = setInterval(updateClock, 1000);

        return () => clearInterval(timerId);
    }, [isCustomTime]);


    useEffect(() => {

        if (curDay && curTime) {
            const todaysSchedule = slotData[curDay] || { theory: [], lab: [] };
            const currTheory = todaysSchedule.theory.find(t => curTime >= t.start && curTime <= t.end);
            const currLab = todaysSchedule.lab.find(l => curTime >= l.start && curTime <= l.end);
            const currTheorySlot = currTheory ? currTheory.slot : null;
            const currLabSlot = currLab ? currLab.slot : null;

            const freeRooms = Object.entries(classData.rooms)
                .filter(([venue, details]) => {
                    const isOccupied = details.occupied_slots.some(booking => {
                        const slotParts = booking.slot.split('+').map(s => s.trim());
                        return slotParts.includes(currTheorySlot) || slotParts.includes(currLabSlot);
                    })
                    return !isOccupied
                })



            setActiveTheorySlot(currTheorySlot);
            setActiveLabSlot(currLabSlot);
            setAllFreeRooms(freeRooms);
            setSelectedBlock(BLOCKS[0]);
        }
    }, [curDay, curTime])

    const allByBlock = Object.entries(classData.rooms || {}).reduce((acc, [venue, details]) => {
        const block = details.block;
        if (!block) return acc;

        if (!acc[block]) acc[block] = { 'theory': [], 'lab': [] };

        const isLab = details.occupied_slots[0].slot.includes('L')

        if (isLab) {
            acc[block].lab.push(venue);
        } else {
            acc[block].theory.push(venue);
        }

        return acc;
    }, {});

    const freeByBlock = (allFreeRooms || []).reduce((acc, [venue, details]) => {
        const block = details.block;
        if (!block) return acc;

        if (!acc[block]) acc[block] = { 'theory': [], 'lab': [] };

        if (details.occupied_slots[0].slot.includes('L'))
            acc[block].lab.push(venue);
        else
            acc[block].theory.push(venue);
        return acc;

    }, {})

    return (

        <div className='w-full h-screen flex flex-col bg-[#EAECEF] text-[#1A1A1A] overflow-hidden overflow-x-hidden no-scrollbar'>
            <div className='w-full flex flex-shrink-0 p-3.5 px-[5%] gap-2 sm:gap-3 justify-between items-center bg-[#FFFFFF] shadow-md relative z-30'>
                <MenuIcon className='!w-7 !h-7 sm:!w-8 sm:!h-8 text-gray-900 flex-shrink-0'></MenuIcon>

                <div className='flex flex-col items-center justify-center flex-1 min-w-0'>
                    <h1 className='text-xl sm:text-3xl font-bold truncate font-display'>SlotSpot</h1>
                    <div className='flex gap-2 sm:gap-3 font-sm items-center justify-center text-[#0F2040] text-xs sm:text-base'>
                        <h1>{`Theory: ${activeTheorySlot ? activeTheorySlot : 'None'}`}</h1>
                        <span className="text-gray-500">•</span>
                        <h1>{`Lab: ${activeLabSlot ? activeLabSlot : 'None'}`}</h1>
                    </div>
                </div>

                <div className='flex flex-col items-center justify-center flex-shrink-0'>
                    <h2 className='text-sm sm:text-lg font-medium'>{curDay}</h2>
                    <h1 className='text-base sm:text-xl font-semibold'>{curTime}</h1>
                </div>
            </div>


            {/* <div className='w-full flex flex-shrink-0 mx-auto max-w-7xl p-6 py-5 gap-3 justify-between items-center'>
                <h1 className='text-2xl px-10 pl-0'>SlotSpot</h1>

                <div className='flex flex-wrap items-center gap-2'>
                    <div className='flex gap-2 tracking-tight leading-none text-2xl'>
                        {isCustomTime ? (
                            <>
                                <select
                                    value={curDay}
                                    onChange={e => setCurDay(e.target.value)}
                                    className='bg-transparent text-2xl'
                                >
                                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <input
                                    type="time"
                                    value={curTime}
                                    onChange={e => setCurTime(e.target.value)}
                                    className='bg-transparent text-2xl'
                                />
                            </>
                        ) : (
                            <>
                                <h1>{curDay}</h1>
                                <h1>{curTime}</h1>
                            </>
                        )}
                    </div>

                    <div className="hidden sm:block h-8 w-[2px] bg-gray-900/30" />

                    
                </div>

                <button
                    onClick={() => setIsCustomTime(prev => !prev)}
                    className='text-sm px-3 py-1 rounded-full border border-gray-900/20'
                >
                    {isCustomTime ? 'Back to live' : 'Custom time'}
                </button>
            </div>
 */}

            <div className="w-full h-[1px] bg-gray-900/20" />

            <div className='w-full flex-1 overflow-y-auto px-4 py-4 no-scrollbar'>
                <div className='w-full flex-shrink-0 relative px-[5%]'>
                    {showLeftFade && (
                        <div className="absolute left-[5%] inset-y-0 w-10 z-20 pointer-events-none bg-gradient-to-r from-[#EAECEF] to-transparent" />
                    )}

                    {showRightFade && (
                        <div className="absolute right-[5%] inset-y-0 w-10 z-20 pointer-events-none bg-gradient-to-l from-[#EAECEF] to-transparent" />
                    )}

                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className='flex items-end gap-0 overflow-x-auto snap-x snap-mandatory no-scrollbar'
                    >
                        {BLOCKS.map((block, index) => {
                            const isSelectedBlock = selectedBlock === block;

                            return (
                                <div
                                    key={block}
                                    onClick={() => setSelectedBlock(block)}
                                    style={{ zIndex: isSelectedBlock ? 30 : BLOCKS.length - index }}
                                    className={`relative snap-start flex-1 min-w-max text-center px-4 sm:px-6 cursor-pointer whitespace-nowrap border border-zinc-300 border-b-0 border-l-0 rounded-t-md [clip-path:polygon(26px_0%,100%_0%,100%_100%,0%_100%,0%_26px)] transition-[transform,background-color,box-shadow] duration-150 ease-out ${isSelectedBlock
                                        ? 'bg-white py-4 -mb-px font-semibold shadow-[-2px_0_4px_rgba(0,0,0,0.08),2px_0_4px_rgba(0,0,0,0.08),0_-1px_0_rgba(255,255,255,0.9)] before:absolute before:left-4 before:right-4 before:top-0 before:h-px before:bg-white/80 before:content-[""]'
                                        : 'bg-zinc-300 py-2.5 shadow-[inset_0_-2px_0_rgba(0,0,0,0.08)] hover:py-3 hover:bg-zinc-100 hover:shadow-[0_4px_0_#18181B] hover:z-40'
                                        }`}
                                >
                                    <span className={`font-display text-xl transition-colors ${isSelectedBlock ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-600 font-medium'}`}>
                                        {block}
                                    </span>

                                    {!isSelectedBlock && (
                                        <div className="absolute right-0 top-0 h-full w-px bg-zinc-400" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {(() => {
                    const blockData = freeByBlock[selectedBlock] || { theory: [], lab: [] };
                    const allBlockData = allByBlock[selectedBlock] || { theory: [], lab: [] };
                    const allTheory = allBlockData.theory;
                    const allLab = allBlockData.lab;
                    const theoryRooms = blockData.theory;
                    const labRooms = blockData.lab;
                    const totalFreeCount = theoryRooms.length + labRooms.length;
                    return (
                        <div className='px-[5%]'>
                            <div className='w-full flex-shrink-0 bg-white relative p-5 -mt-0 box-shadow:inset 0 1px 0 rgba(255,255,255,.6);'>
                                <div className='flex items-end gap-8 mb-6'>
                                    <div>
                                        <CountUp
                                            from={0}
                                            to={theoryRooms.length + labRooms.length}
                                            separator=","
                                            direction="up"
                                            duration={1}
                                            className="count-up-text h1 text-3xl font-bold"
                                            delay={0}
                                        />
                                            <p className='text-lg'>FREE</p>
                                    </div>
                                    <div className='text-gray-700'>
                                        <p className='h1 text-xl'>{allTheory.length + allLab.length}</p>
                                        <p className='text-sm'>TOTAL</p>
                                    </div>
                                </div>

                                <div className='mb-4'>
                                    <h1 className='text-xl mb-2'>THEORY</h1>
                                    <div className='w-full h-[2px] bg-gray-500 mb-4'></div>
                                    <motion.div
                                        key={selectedBlock}
                                        initial="hidden"
                                        animate="show"
                                        className="font-medium grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 mb-4 w-full tracking-wider">
                                        {(hideOccupied || allTheory.length === 0) && theoryRooms.length === 0 ? (
                                            <div className="bg-[#EAECEF] border border-gray-300 py-2 px-4 w-full flex flex-col justify-center rounded hover:-translate-y-px">
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <p className='text-[10px] font-bold text-gray-500 tracking-wider uppercase'>NONE</p>
                                                </div>
                                            </div>
                                        ) :
                                            (
                                                <>
                                                    {
                                                        theoryRooms.map((theory, index) => (
                                                            <div key={theory}>
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    transition={{
                                                                        duration: 0.15,
                                                                        delay: index * 0.01,
                                                                        ease: [0.2, 0.8, 0.2, 1],
                                                                    }}
                                                                    className="animate-room-enter bg-white border border-gray-400 py-2 px-4 w-full flex flex-col justify-center rounded hover:-translate-y-0.5 hover:border-zinc-500 hover:shadow-[3px_3px_0px_#18181B] transition-[transform,border-color,box-shadow] duration-150 ease-out"
                                                                >
                                                                    <p className='text-lg font-bold text-gray-900 tracking-wide font-display'>{theory}</p>

                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                        <p className='text-[10px] font-bold text-emerald-600 tracking-wider uppercase'>FREE</p>
                                                                    </div>
                                                                </motion.div>

                                                            </div>
                                                        ))}

                                                    {!hideOccupied &&
                                                        allTheory.filter(t => !theoryRooms.includes(t)).map((theory, index) => (
                                                            <div key={theory}>
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    transition={{
                                                                        duration: 0.15,
                                                                        delay: (theoryRooms.length + index) * 0.01,
                                                                        ease: [0.2, 0.8, 0.2, 1],
                                                                    }}
                                                                    className="animate-room-enter bg-[#EAECEF] border border-gray-300 py-2 px-4 w-full flex flex-col justify-center rounded hover:-translate-y-px">
                                                                    <p className='text-lg font-bold text-gray-600 tracking-wide font-display'>{theory} </p>

                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                        <p className='text-[10px] font-bold text-gray-500 tracking-wider uppercase'>IN USE</p>
                                                                    </div>
                                                                </motion.div>

                                                            </div>
                                                        ))}

                                                </>
                                            )
                                        }
                                    </motion.div>
                                </div>

                                <div>
                                    <h1 className='text-xl mb-2'>LAB</h1>
                                    <div className='w-full h-[2px] bg-gray-500 mb-4'></div>
                                    <motion.div
                                        key={selectedBlock}
                                        initial="hidden"
                                        animate="show"
                                        className="font-medium grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 mb-4 w-full tracking-wider">
                                        {(hideOccupied || allLab.length === 0) && labRooms.length === 0 ? (
                                            <div className="bg-[#EAECEF] border border-gray-300 py-2 px-4 w-full flex flex-col justify-center rounded hover:-translate-y-px">
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <p className='text-[10px] font-bold text-gray-500 tracking-wider uppercase'>NONE</p>
                                                </div>
                                            </div>
                                        ) :
                                            (
                                                <>
                                                    {
                                                        labRooms.map((lab, index) => (
                                                            <div key={lab}>
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    transition={{
                                                                        duration: 0.15,
                                                                        delay: index * 0.01,
                                                                        ease: [0.2, 0.8, 0.2, 1],
                                                                    }}
                                                                    className="bg-white border border-gray-400 py-2 px-4 w-full flex flex-col justify-center rounded hover:-translate-y-0.5 hover:border-zinc-500 hover:shadow-[3px_3px_0px_#18181B] transition-[transform,border-color,box-shadow] duration-150 ease-out">
                                                                    <p className='text-lg font-bold text-gray-900 tracking-wide font-display'>{lab}</p>

                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                        <p className='text-[10px] font-bold text-emerald-600 tracking-wider uppercase'>FREE</p>
                                                                    </div>
                                                                </motion.div>

                                                            </div>
                                                        ))}

                                                    {!hideOccupied &&
                                                        allLab.filter(t => !labRooms.includes(t)).map((lab, index) => (
                                                            <div key={lab}>
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    transition={{
                                                                        duration: 0.15,
                                                                        delay: (labRooms.length + index) * 0.01,
                                                                        ease: [0.2, 0.8, 0.2, 1],
                                                                    }}
                                                                    className="bg-[#EAECEF] border border-gray-300 py-2 px-4 w-full flex flex-col justify-center rounded">
                                                                    <p className='text-lg font-bold text-gray-600 tracking-wide font-display'>{lab} </p>

                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                        <p className='text-[10px] font-bold text-gray-500 tracking-wider uppercase'>IN USE</p>
                                                                    </div>
                                                                </motion.div>

                                                            </div>
                                                        ))}

                                                </>
                                            )
                                        }
                                    </motion.div>
                                </div>
                            </div>
                        </div>)
                })()}



                <div className='max-w-7xl mx-auto w-full'>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={hideOccupied}
                            onChange={(e) => setHideOccupied(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className={`relative w-9 h-5 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-soft dark:peer-focus:ring-brand-soft rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand 
                            ${hideOccupied ?
                                'bg-[#86CC70]' :
                                'bg-red-400'
                            }`}></div>
                        <span className="select-none ms-3 text-sm font-medium text-heading">Hide Occupied Classrooms</span>
                    </label>
                </div>
            </div>
        </div >
    )
}
