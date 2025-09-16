export default function Home() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 p-6">
      {/* Produtos */}
      <div className="bg-white rounded-lg shadow p-6">
        <img 
          src="https://via.placeholder.com/300x200" 
          alt="Cupcake" 
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        <h3 className="text-lg font-semibold">Cupcake de Chocolate</h3>
        <p className="text-gray-500 mt-2">Delicioso cupcake de chocolate com cobertura de brigadeiro</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-lg font-bold">R$ 8,90</span>
          <button className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600">
            Adicionar
          </button>
        </div>
      </div>

      {/* Mais produtos serão adicionados aqui */}
    </div>
  );
}
