import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { createContext, useState } from "react"
import { db } from "../firebaseConfig.js"

export const GoalsContext = createContext()

export function GoalsProvider({ children }) {
  const [goals, setGoals] = useState([])
  const [reminders, setReminders] = useState([])

  async function fetchGoals() {
    try {
      const querySnapshot = await getDocs(collection(db, 'goals'))
      const goalsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setGoals(goalsData)
    } catch (error) {
      console.error("Error fetching goals:", error)
    }
  }

  async function createGoal(goalData) {
    try {
      console.log(goalData)
      await addDoc(collection(db, 'goals'), goalData)
      await fetchGoals() // Refresh goals after creating
    } catch (error) {
      console.error("Error creating goal:", error)
    }
  }

  async function deleteGoal(goalId) {
    try {
      await deleteDoc(doc(db, 'goals', goalId))
      await fetchGoals() // Refresh goals after deleting
    } catch (error) {
      console.error("Error deleting goal:", error)
    }
  }

  async function updateGoal(goalId, updatedData) {
    try {
      await updateDoc(doc(db, 'goals', goalId), updatedData)
      await fetchGoals() // Refresh goals after updating
    } catch (error) {
      console.error("Error updating goal:", error)
    }
  }

  // Reminder functions
  async function fetchReminders() {
    try {
      const querySnapshot = await getDocs(collection(db, 'reminders'))
      const remindersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setReminders(remindersData)
    } catch (error) {
      console.error("Error fetching reminders:", error)
    }
  }

  async function createReminder(reminderData) {
    try {
      console.log("Creating reminder:", reminderData)
      await addDoc(collection(db, 'reminders'), reminderData)
      await fetchReminders() // Refresh reminders after creating
    } catch (error) {
      console.error("Error creating reminder:", error)
    }
  }

  async function deleteReminder(reminderId) {
    try {
      await deleteDoc(doc(db, 'reminders', reminderId))
      await fetchReminders() // Refresh reminders after deleting
    } catch (error) {
      console.error("Error deleting reminder:", error)
    }
  }

  async function updateReminder(reminderId, updatedData) {
    try {
      await updateDoc(doc(db, 'reminders', reminderId), updatedData)
      await fetchReminders() // Refresh reminders after updating
    } catch (error) {
      console.error("Error updating reminder:", error)
    }
  }

  return (
    <GoalsContext.Provider
      value={{
        goals,
        reminders,
        fetchGoals,
        createGoal,
        deleteGoal,
        updateGoal,
        fetchReminders,
        createReminder,
        deleteReminder,
        updateReminder
      }}
    >
      {children}
    </GoalsContext.Provider>
  )
}
