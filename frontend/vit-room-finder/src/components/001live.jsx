import React, { useState, useEffect } from 'react'
import classData from "../../rawdata/mockffcs.json"
import slotData from "../../rawdata/slotTimings.json"

export default function Live() {
    const [activeTheorySlot, setActiveTheorySlot]=useState(null);
    const [activeLabSlot, setActiveLabSlot]=useState(null);
    const [freeTheory, setFreeTheory] = useState(null);
    const [freeLab, setFreeLab] = useState(null);
    const [freeByBlock, setFreeByBlock] = useState({});
    const [curDay, setCurDay] = useState('');
    const [curTime, setCurTime] = useState('');
    //test var rem later
    const [ab1, setAb1]=useState(null);


    useEffect(() => {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const currentDay='Monday';
        //const currentDay = days[now.getDay()];
        //const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const currentTimeStr = "08:30";
        if (currentDay)
            setCurDay(currentDay);
        if (currentTimeStr)
            setCurTime(currentTimeStr);

        if (currentDay && currentTimeStr) {
            const todaysSchedule = slotData[currentDay] || { theory: [], lab: [] };
            const currTheory = todaysSchedule.theory.find(t => currentTimeStr >= t.start && currentTimeStr <= t.end);
            const currLab = todaysSchedule.lab.find(l => currentTimeStr >= l.start && currentTimeStr <= l.end);
            const currTheorySlot = currTheory ? currTheory.slot : null;
            const currLabSlot = currLab ? currLab.slot : null;

            const freeRoomsSlots = classData.filter(item => {
                const itemSlots = item.SLOT.split('+').map(s => s.trim());
                const isTheoryOccupied = currTheorySlot && itemSlots.includes(currTheorySlot);
                const isLabOccupied = currLabSlot && itemSlots.includes(currLabSlot);

                return !(isTheoryOccupied || isLabOccupied);

            });

            const freeTheorySlots = freeRoomsSlots.filter(item => {
                return !(item.SLOT.includes('L'))
            })

            const freeLabSlots = freeRoomsSlots.filter(item => {
                return (item.SLOT.includes('L'))
            })

            const freeTheoryRooms = [...new Set(freeTheorySlots.map(item => String(item.VENUE) || ""))].sort()
            const freeLabRooms = [...new Set(freeLabSlots.map(item => String(item.VENUE) || ""))].sort()

            

            const blocks = ['AB1', 'AB2', 'AB3', 'AB4', 'AB5', 'ADB', 'MAB3', 'MAB4'];
            const blocksMapping = {};

            blocks.forEach(block => {
                blocksMapping[block] = {
                    theory: freeTheoryRooms.filter(room => room && room.startsWith(block)),
                    lab: freeLabRooms.filter(room => room && room.startsWith(block))
                }
            })

            setActiveTheorySlot(currTheorySlot);
            setActiveLabSlot(currLabSlot);
            setFreeTheory(freeTheoryRooms);
            setFreeLab(freeLabRooms);
            setFreeByBlock(blocksMapping);
            setAb1(blocksMapping['AB1']);
        }


    },[])

    return (
        <div className='w-screen h-screen flex flex-col justify-between'>
            <div className='w-full '>
                <h1>Live Room View</h1>
                <h1>{curDay}</h1>
                <h1>{curTime}</h1>
                <h1>{activeTheorySlot}</h1>
                <h1>{activeLabSlot}</h1>
            </div>
            <div>
                {ab1 && ab1['theory'].map((room)=>{
                    return(
                        <p key={room}>{room}</p>
                    )
                })}
            </div>
        </div>
    )
}
