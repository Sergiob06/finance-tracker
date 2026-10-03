import { useState } from 'react'
import Modal from '../Modal'
import FormField from '../FormField'
import { useContributeSavingsGoal } from '../../hooks/useSavingsGoals'

export default function ContributeModal({ onClose, savingsGoal }) {
  const contribute = useContributeSavingsGoal()
  const [amount, setAmount] = useState('')
  const errors = contribute.error?.response?.data?.errors ?? {}

  function handleSubmit(event) {
    event.preventDefault()
    contribute.mutate({ id: savingsGoal.id, amount }, { onSuccess: onClose })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Aportar a "${savingsGoal.name}"`}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="contribute-form"
            disabled={contribute.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {contribute.isPending ? 'Aportando…' : 'Aportar'}
          </button>
        </>
      }
    >
      <form id="contribute-form" onSubmit={handleSubmit}>
        <FormField
          label="Cantidad a aportar"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          error={errors.amount}
        />
      </form>
    </Modal>
  )
}
