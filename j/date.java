//-----------------------------------------//

import java.time.LocalDate;

public class Main {
  public static void main(String[] args) {
    LocalDate myObj = LocalDate.now();
    System.out.println(myObj);
  }
}

//-----------------------------------------//

import java.time.LocalTime;

public class Main {
  public static void main(String[] args) {
    LocalTime myObj = LocalTime.now();
    System.out.println(myObj);
  }
}

//-----------------------------------------//

import java.util.Scanner;

class MyClass {
  public static void main(String[] args) {
    Scanner myObj = new Scanner(System.in);
    System.out.println("lol");

    String userName = myObj.nextLine();
    System.out.println("Username is: " + userName);
  }
}

//-----------------------------------------//

class Animal {
  public void animalSound() {
    System.out.println("The animal makes a sound");
  }
}

class Pig extends Animal {
  public void animalSound() {
    System.out.println("The pig says: wee wee");
  }
}

class Dog extends Animal {
  public void animalSound() {
    System.out.println("The dog says: bow wow");
  }
}

class Main {
  public static void main(String[] args) {
    Animal myAnimal = new Animal();  // Create a Animal object
    Animal myPig = new Pig();  // Create a Pig object
    Animal myDog = new Dog();  // Create a Dog object
    myAnimal.animalSound();
    myPig.animalSound();
    myDog.animalSound();
  }
}

//-----------------------------------------//
