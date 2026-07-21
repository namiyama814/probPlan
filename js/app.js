const projectSection = document.getElementById("project-section");
const taskSection = document.getElementById("task-section");
const resultSection = document.getElementById("result-section");

projectSection.innerHTML = `
<div class="bg-white rounded-xl shadow p-6">
    <h2 class="text-xl font-semibold">
        プロジェクト
    </h2>

    <p class="mt-2 text-slate-500">
        プロジェクトを作成してください
    </p>
</div>
`;

taskSection.innerHTML = `
<div class="bg-white rounded-xl shadow p-6">
    <h2 class="text-xl font-semibold">
        タスク一覧
    </h2>
</div>
`;

resultSection.innerHTML = `
<div class="bg-white rounded-xl shadow p-6">
    <h2 class="text-xl font-semibold">
        シミュレーション結果
    </h2>
</div>
`;