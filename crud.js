const collection = db.collection("items");

async function createItem() {
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();;
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0]; 

  if (!name || !description) {
    alert("Preencha os campos obrigatórios!", true);
    return;
  }

  let fileUrl = null;

  try {
    if (file) {
      fileUrl = await uploadFile(file);
    }

  const doc = {
    name,
    description,
    url: fileUrl,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await collection.add(doc)

  showMessage("Item salvo com ID: " + docRef.id, false);

  document.getElementById("name").value = "";
  document.getElementById("description").value = "";
  fileInput.value = "";

    listItems();

    if (typeof closeModal === "function") closeModal();
  } catch (error){
    showMessage("Erro ao salvar item: " + error.message, true);
  }
}


  const modal = document.getElementById("itemModal");
  const openBtn = document.getElementById("openModalBtn");
  const closeBtn = document.getElementById("closeModalBtn");

  // Abrir modal
  openBtn.onclick = () => {
    modal.style.display = "block";
  };

  // Fechar modal clicando no X
  closeBtn.onclick = () => {
    modal.style.display = "none";
  };

  // Fechar modal clicando fora do conteúdo
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // Fechar modal após salvar o item
  function closeModal() {
    modal.style.display = "none";
    // Limpar campos, se quiser:
    document.getElementById("name").value = "";
    document.getElementById("description").value = "";
    document.getElementById("fileInput").value = "";
    document.getElementById("uploadProgress").value = 0;
  }

async function listItems() {
  const tbody = document.querySelector("#itemTable tbody");
  tbody.innerHTML = "";

  const snapshot = await collection.orderBy("createdAt", "desc").get();
  snapshot.forEach(doc => {
    const data = doc.data();

    const tr = document.createElement("tr");

    // Nome
    const tdName = document.createElement("td");
    tdName.textContent = data.name;
    tr.appendChild(tdName);


     // Descrição resumida + botão ver mais
    const tdDesc = document.createElement("td");
    const shortDesc = data.description.length > 20 ? data.description.slice(0, 20) + "..." : data.description;
    tdDesc.textContent = shortDesc + " ";
    
    if (data.description.length > 20) {
      const btnViewMore = document.createElement("button");
      btnViewMore.textContent = "Ver mais";
      btnViewMore.classList.add("view-more-btn");
      btnViewMore.onclick = () => openDescriptionModal(data.description);
      tdDesc.appendChild(btnViewMore);
    }
    tr.appendChild(tdDesc);

    // Link do arquivo (se existir)
    const tdUrl = document.createElement("td");
    if (data.url) {
      const a = document.createElement("a");
      a.href = data.url;
      a.target = "_blank";
      a.textContent = "Ver Arquivo";
      tdUrl.appendChild(a);
    } else {
      tdUrl.textContent = "-";
    }
    tr.appendChild(tdUrl);

    // Botão excluir
    const tdActions = document.createElement("td");
    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Excluir";
    btnDelete.classList.add("delete-btn");
    btnDelete.onclick = () => deleteItem(doc.id);
    tdActions.appendChild(btnDelete);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });
}

async function deleteItem(docId) {
  if (confirm("Tem certeza que deseja excluir este item?")) {
    try {
      await collection.doc(docId).delete();
      showMessage("Item excluído com sucesso!", false);
      listItems();
    } catch (error) {
      showMessage("Erro ao excluir item: " + error.message, true);
    }
  }
}

// Abrir modal com a descrição completa
function openDescriptionModal(text) {
  const modal = document.getElementById("modal");
  const desc = document.getElementById("modalDescription");

  desc.textContent = text;
  modal.style.display = "flex";
}

// Fechar modal
document.getElementById("modalClose").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});

// Fechar modal clicando fora do conteúdo
window.addEventListener("click", (e) => {
  const modal = document.getElementById("modal");
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", listItems);