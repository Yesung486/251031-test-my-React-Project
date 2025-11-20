// 파일 위치: components/game-neon-breaker/ProjectInfoModal.tsx

import React from 'react';
import { X } from 'lucide-react';

interface ProjectInfoModalProps {
  onClose: () => void;
}

const ProjectInfoModal: React.FC<ProjectInfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
          <h2 className="text-2xl font-bold text-cyan-400">프로젝트 상세 정보</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-400 hover:text-white" />
          </button>
        </div>

        <div className="p-6 space-y-8 text-slate-200">

          <section>
            <h3 className="text-lg font-bold text-white mb-3 border-l-4 border-cyan-500 pl-3">
              #Result 1. 구현한 내용 (기능과 UX/UI)
            </h3>
            <ul className="list-decimal list-inside space-y-2 text-sm leading-relaxed opacity-90">
              <li><strong className="text-cyan-300">아이템 시스템:</strong> 특정 벽돌(마크 표시) 파괴 시 '멀티볼' 아이템이 떨어지며, 획득 시 공이 3개로 분열됩니다.</li>
              <li><strong className="text-cyan-300">직관적 UI:</strong> 벽돌 중앙에 숫자를 표시하여 남은 타격 횟수를 명확하게 전달합니다.</li>
              <li><strong className="text-cyan-300">다중 물리 연산:</strong> 여러 개의 공이 동시에 벽돌/패들과 상호작용하도록 물리 엔진을 업그레이드했습니다.</li>
              <li><strong className="text-cyan-300">강화된 피드백:</strong> 아이템 생성/획득 및 벽돌 내구도 감소 시 청각적/시각적 피드백을 강화했습니다.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3 border-l-4 border-purple-500 pl-3">
              #Result 2. 다음에 만드려는 것 3가지 제안
            </h3>
            <ul className="list-decimal list-inside space-y-2 text-sm leading-relaxed opacity-90">
              <li><strong className="text-purple-300">다양한 아이템 추가:</strong> 패들 길이 증가, 레이저 발사, 공 속도 감소 등 전략적 요소를 더하는 아이템.</li>
              <li><strong className="text-purple-300">보스전 스테이지:</strong> 움직이는 거대 벽돌(보스)이 미사일을 쏘는 탄막 피하기 요소 결합.</li>
              <li><strong className="text-purple-300">글로벌 랭킹 시스템:</strong> Firebase 등 DB를 연동하여 친구들과 최고 점수를 경쟁하는 리더보드.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3 border-l-4 border-emerald-500 pl-3">
              #Result 3. 구현 기능의 인지 심리학적 원리
            </h3>
            <ul className="list-decimal list-inside space-y-2 text-sm leading-relaxed opacity-90">
              <li><strong className="text-emerald-300">행동 유도성 (Affordance):</strong> 아이템이 들어있는 벽돌에 '작은 원' 마크를 그려, 플레이어가 해당 벽돌을 우선 목표로 삼도록 유도했습니다.</li>
              <li><strong className="text-emerald-300">가시성 (Visibility):</strong> 벽돌의 남은 체력을 '숫자'로 명시하여 플레이어가 전략(어떤 벽돌부터 깰지)을 세우는 인지 비용을 줄였습니다.</li>
              <li><strong className="text-emerald-300">변동 보상 스케줄:</strong> 모든 벽돌이 아닌 '일부' 벽돌에서만 아이템이 나오게 하여, 획득 시 도파민 분비를 극대화했습니다.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3 border-l-4 border-amber-500 pl-3">
              #Result 4. 코딩 개념 (새로운 함수/개념)
            </h3>
            <ul className="list-decimal list-inside space-y-2 text-sm leading-relaxed opacity-90">
              <li><strong className="text-amber-300">Array.splice():</strong> 배열에서 특정 요소를 제거할 때 사용합니다. 죽은 공이나 먹은 아이템을 메모리에서 삭제할 때 썼습니다.</li>
              <li><strong className="text-amber-300">ctx.fillText():</strong> HTML5 Canvas 위에 텍스트(숫자)를 그리는 함수입니다. 벽돌의 내구도를 표기하는 데 사용했습니다.</li>
              <li><strong className="text-amber-300">Spread Operator (...):</strong> 기존 공 배열에 새로운 공들을 합칠 때 `[...oldBalls, ...newBalls]` 형태로 사용하여 불변성을 유지하며 배열을 확장했습니다.</li>
              <li><strong className="text-amber-300">Item Interface:</strong> 공이나 벽돌 외에 '떨어지는 물체'라는 새로운 객체 타입을 정의하여 물리 법칙(중력)을 다르게 적용했습니다.</li>
            </ul>
          </section>

        </div>
        <div className="p-6 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoModal;