const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  // Seed products
  const products = [
    {
      title: 'Laptop',
      price: 999.99,
      stock: 10,
      category: 'Electronics'
    },
    {
      title: 'Smartphone',
      price: 499.99,
      stock: 15,
      category: 'Electronics'
    },
    {
      title: 'Headphones',
      price: 99.99,
      stock: 20,
      category: 'Accessories'
    },
    {
      title: 'Mouse',
      price: 29.99,
      stock: 30,
      category: 'Accessories'
    }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product
    });
  }

  // Add initial categories
  const categories = [
    { name: 'Electronics' },
    { name: 'Accessories' },
    { name: 'Computers' },
    { name: 'Mobile Phones' }
  ];

  for (const category of categories) {
    await prisma.category.create({
      data: category
    });
  }

  // Add initial brands
  const brands = [
    { name: 'Apple' },
    { name: 'Samsung' },
    { name: 'Dell' },
    { name: 'HP' },
    { name: 'Lenovo' }
  ];

  for (const brand of brands) {
    await prisma.brand.create({
      data: brand
    });
  }

  // Add initial warehouses
  const warehouses = [
    {
      name: 'Main Warehouse',
      email: 'main@warehouse.com',
      phone: '+1234567890',
      address: '123 Main Street',
      city: 'New York',
      country: 'USA'
    },
    {
      name: 'Central Storage',
      email: 'central@warehouse.com',
      phone: '+0987654321',
      address: '456 Central Avenue',
      city: 'Los Angeles',
      country: 'USA'
    }
  ];

  for (const warehouse of warehouses) {
    await prisma.warehouse.create({
      data: warehouse
    });
  }

  console.log('Database has been seeded');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 