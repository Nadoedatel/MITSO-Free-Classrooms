import { useScheduleGroup } from "@/stores/getScheduleGroup";
import { useUserDate } from "@/stores/getUserDate"
import { useAuditorium } from "@/stores/objectAuditorium"
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";

export const useCheckBusyAuditorium = defineStore("checkBusyAuditorium", () => {
  const formScheduleStore = useScheduleGroup();
  const formUserDate = useUserDate();
  const formAuditoriumStore = useAuditorium();
  const isLoading = ref(false);
  const { arrSchedule } = storeToRefs(formScheduleStore)
  // Инициализация должна быть асинхронной
  const initFullSchedule = async (nameCorpus) => {
    const timeSlots = [
      '08.00-9.25',
      '09.35-11.00', 
      '11.10-12.35',
      '13.05-14.30',
      '14.40-16.05',
      '16.35-18.00',
      '18.10-19.35',
      '19.45-21.10'
    ];
    console.log(nameCorpus);
    
    if (nameCorpus === 'auditoriumsInNewCorpus') {
      const auditoriumsInNewCorpus = [
        "71", "72", "73", "74",
        "61", "62", "63", "64",
        "51", "52", "53", "54", 
        "41","42", "43", "44",
        "31", "32", "33", "34",
        "21", "22", "23", "24"
      ]; 
      await formAuditoriumStore.initSchedule(auditoriumsInNewCorpus, timeSlots);
    } else if (nameCorpus === 'auditoriumsInOldCorpus') {
      const auditoriumsInOldCorpus = [
        "303", "302", "301"
      ];
      await formAuditoriumStore.initSchedule(auditoriumsInOldCorpus, timeSlots);
    } else if (nameCorpus === 'auditoriumsInDormitory') {
      const auditoriumsInDormitory = [
        "409 чжф",  "709 чжф"
      ];
      await formAuditoriumStore.initSchedule(auditoriumsInDormitory, timeSlots);
    }   
    bookAuditorium()
  }
  
  const bookAuditorium = async () => {
    try {
      if (!arrSchedule.value.length) {
        await formScheduleStore.getScheduleGroup();
      }
  
      for (const item of arrSchedule.value) {
        const { 
          auditorium = '', 
          time = '', 
          group_class: group = '', 
          date = '' 
        } = item;
  
        if (!auditorium || !time || !group || !date) {
          console.warn("Пропуск элемента: не все данные доступны", item);
          continue;
        }
  
        // Проверяем, есть ли уже занятие в этой аудитории и временном слоте (без нормализации времени)
        const existingLesson = formAuditoriumStore.fullSchedule[auditorium]?.[time];
  
        if (existingLesson) {
          console.log("Занятие уже существует, обновляем:", { auditorium, time });
          // Просто перезаписываем (если логика хранилища это позволяет)
          await formAuditoriumStore.addLesson(auditorium, time, { group, date });
        } else {
          console.log("Добавляем новое занятие:", { auditorium, time });
          await formAuditoriumStore.addLesson(auditorium, time, { group, date });
        }
      }
  
      console.log("Все аудитории обработаны!");
    } catch (error) {
      console.error("Ошибка при бронировании:", error.message);
    }
  };
  
  // Асинхронная загрузка расписания
  async function loadSchedule() {
    try {
      isLoading.value = true;
      await formUserDate.getUserCurrentDate();
      await formScheduleStore.getScheduleGroup();
      
      console.log("Загруженное расписание:", formScheduleStore.arrSchedule);
      
      // Проверяем что данные загрузились
      if (!formScheduleStore.arrSchedule || Object.keys(formScheduleStore.arrSchedule).length === 0) {
        throw new Error("Расписание не содержит данных");
      }
      
    } catch (error) {
      console.error("Ошибка загрузки расписания:", error);
      throw error; // Пробрасываем ошибку выше
    } finally {
      isLoading.value = false;
    }
  }
  
  return {
    loadSchedule,
    initFullSchedule,
    bookAuditorium,
    isLoading
  };
});
