'use client'

import ProgramsEditor from '@/components/event/programs-editor'
import type { ProgramItem } from '@/types'

interface StepProgramsState {
  programs: ProgramItem[]
}

interface Props {
  state: StepProgramsState
  update: (partial: Partial<StepProgramsState>) => void
}

export default function StepPrograms({ state, update }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-[#1a1a1a]">Davetiye Sayfası</h2>
        <p className="text-sm text-[#7a6a5a] mt-1">
          Buraya eklediğiniz programlar, misafirlerinizin göreceği davetiye sayfasında listelenir.
        </p>
      </div>

      <ProgramsEditor
        items={state.programs}
        onChange={(programs) => update({ programs })}
      />
    </div>
  )
}
